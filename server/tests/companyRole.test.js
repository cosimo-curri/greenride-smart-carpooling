"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const controller = require("../controllers/companies");

test("administrator login carries an explicit role rather than relying on a fixed frontend email", async () => {
    const existingEmail = process.env.ADMIN_GREENRIDE_EMAIL;
    const existingPassword = process.env.ADMIN_GREENRIDE_PASSWORD;
    process.env.ADMIN_GREENRIDE_EMAIL = "custom-admin@example.org";
    process.env.ADMIN_GREENRIDE_PASSWORD = "local-test-password";
    process.env.AUTH_SECRET_ENCODING_PASSPHRASE ||= "local-test-jwt-secret";
    let result;
    try {
        await controller.signin({
            body: { email: "custom-admin@example.org", password: "local-test-password" }
        }, { json: data => { result = data; return data; } });
        assert.equal(result.message, "ADMIN_SIGNIN_OK");
        assert.equal(result.company.email, "custom-admin@example.org");
        assert.equal(result.company.isAdmin, true);
        assert.equal(typeof result.token, "string");
    } finally {
        if(existingEmail === undefined) delete process.env.ADMIN_GREENRIDE_EMAIL;
        else process.env.ADMIN_GREENRIDE_EMAIL = existingEmail;
        if(existingPassword === undefined) delete process.env.ADMIN_GREENRIDE_PASSWORD;
        else process.env.ADMIN_GREENRIDE_PASSWORD = existingPassword;
    }
});
