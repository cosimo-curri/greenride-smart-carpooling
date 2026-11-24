"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const Company = require("../models/companies");
const mail = require("../utils/nodemailer");

// Replace only the outgoing email with a local test response. The actual
// password-reset route (including its persistence and validation) still runs.
const originalMailer = mail.changePasswordRequest;
let deliveries = [];
mail.changePasswordRequest = (req, res) => {
    deliveries.push({
        email: req.body.email,
        token: req.body.changePasswordToken
    });
    return res.json({ message: "EMAIL_SEND_OK" });
};
const passwordRouter = require("../routes/api_companies_routes/managePassword");
mail.changePasswordRequest = originalMailer;

const secret = "test-only-password-reset-jwt-secret";

async function runWithServer(callback) {
    const originalFindOne = Company.findOne;
    const originalSecret = process.env.COMPANY_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE;
    process.env.COMPANY_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE = secret;
    deliveries = [];

    const app = express();
    app.use(express.json());
    app.use(passwordRouter);
    const server = app.listen(0, "127.0.0.1");
    try {
        await new Promise(resolve => server.once("listening", resolve));
        const post = async (path, data) => {
            const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            assert.equal(response.status, 200);
            return response.json();
        };
        await callback(post);
    } finally {
        Company.findOne = originalFindOne;
        if(originalSecret === undefined)
            delete process.env.COMPANY_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE;
        else
            process.env.COMPANY_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE = originalSecret;
        await new Promise(resolve => server.close(resolve));
    }
}

test("reset email is sent only after its token is persisted", async () => {
    await runWithServer(async post => {
        let persistedToken;
        Company.findOne = async query => {
            assert.deepEqual(query, { email: "company@example.org" });
            return {
                changePasswordToken: null,
                save: async function() { persistedToken = this.changePasswordToken; }
            };
        };
        const response = await post("/requestRestorePassword", { email: "company@example.org" });
        assert.equal(response.message, "EMAIL_SEND_OK");
        assert.equal(deliveries.length, 1);
        assert.equal(deliveries[0].email, "company@example.org");
        assert.equal(deliveries[0].token, persistedToken);
        assert.equal(jwt.verify(persistedToken, secret).data, "company@example.org");
    });
});

test("a database failure prevents reset email from being sent", async () => {
    await runWithServer(async post => {
        Company.findOne = async () => ({ save: async () => { throw Error("database unavailable"); } });
        const response = await post("/requestRestorePassword", { email: "company@example.org" });
        assert.equal(response.message, "RESTORE_PASSWORD_COMPANY_ERROR");
        assert.equal(deliveries.length, 0);
    });
});

test("new password and token invalidation are persisted before success", async () => {
    await runWithServer(async post => {
        const token = jwt.sign({ data: "company@example.org" }, secret, { expiresIn: "1d" });
        let passwordUpdated = false;
        let saved = false;
        Company.findOne = async query => {
            assert.deepEqual(query, { changePasswordToken: token });
            return {
                changePasswordToken: token,
                setPassword: async password => {
                    assert.equal(password, "Str0ng!Pass2026");
                    passwordUpdated = true;
                },
                save: async function() {
                    assert.equal(passwordUpdated, true);
                    assert.equal(this.changePasswordToken, null);
                    saved = true;
                }
            };
        };
        const response = await post("/restorePassword", {
            changePasswordToken: token,
            password1: "Str0ng!Pass2026",
            password2: "Str0ng!Pass2026"
        });
        assert.equal(response.message, "RESTORE_PASSWORD_COMPANY_OK");
        assert.equal(saved, true);
    });
});

test("failed password persistence returns an error, not success", async () => {
    await runWithServer(async post => {
        const token = jwt.sign({ data: "company@example.org" }, secret, { expiresIn: "1d" });
        Company.findOne = async () => ({
            changePasswordToken: token,
            setPassword: async () => {},
            save: async () => { throw Error("database unavailable"); }
        });
        const response = await post("/restorePassword", {
            changePasswordToken: token,
            password1: "Str0ng!Pass2026",
            password2: "Str0ng!Pass2026"
        });
        assert.equal(response.message, "RESTORE_PASSWORD_COMPANY_ERROR");
    });
});

test("password hashing errors and invalid tokens are handled", async () => {
    await runWithServer(async post => {
        const token = jwt.sign({ data: "company@example.org" }, secret, { expiresIn: "1d" });
        let saveCalled = false;
        Company.findOne = async () => ({
            setPassword: async () => { throw Error("hashing failed"); },
            save: async () => { saveCalled = true; }
        });
        const rejected = await post("/restorePassword", {
            changePasswordToken: token,
            password1: "Str0ng!Pass2026",
            password2: "Str0ng!Pass2026"
        });
        assert.equal(rejected.message, "RESTORE_PASSWORD_COMPANY_ERROR");
        assert.equal(saveCalled, false);

        Company.findOne = async () => { throw Error("invalid token should be rejected first"); };
        const invalid = await post("/restorePassword", {
            changePasswordToken: "not-a-valid-jwt",
            password1: "Str0ng!Pass2026",
            password2: "Str0ng!Pass2026"
        });
        assert.equal(invalid.message, "RESTORE_PASSWORD_COMPANY_ERROR");
    });
});


test("password reset uses the actual passport-local-mongoose hashing method", async () => {
    await runWithServer(async post => {
        const originalSave = Company.prototype.save;
        const token = jwt.sign({ data: "company@example.org" }, secret, { expiresIn: "1d" });
        const company = new Company({
            name: "Example company",
            VAT: "12345678900",
            email: "company@example.org",
            logoURL: "example-logo.svg",
            headquartersCoordinates: { type: "Point", coordinates: [12, 41] },
            changePasswordToken: token
        });
        let persisted = false;
        Company.findOne = async () => company;
        Company.prototype.save = async function() {
            assert.equal(this.changePasswordToken, null);
            assert.ok(this.hash);
            assert.ok(this.salt);
            persisted = true;
            return this;
        };
        try {
            const response = await post("/restorePassword", {
                changePasswordToken: token,
                password1: "Str0ng!Pass2026",
                password2: "Str0ng!Pass2026"
            });
            assert.equal(response.message, "RESTORE_PASSWORD_COMPANY_OK");
            assert.equal(persisted, true);
            const auth = await company.authenticate("Str0ng!Pass2026");
            assert.equal(auth.user, company);
        } finally {
            Company.prototype.save = originalSave;
        }
    });
});
