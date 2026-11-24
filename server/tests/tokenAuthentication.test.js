"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const Company = require("../models/companies");
const Employee = require("../models/employees");
const auth = require("../utils/tokenAuthentication");

const secret = "validation-only-long-random-secret";
process.env.AUTH_SECRET_ENCODING_PASSPHRASE = secret;

const call = async (middleware, token) => {
    let value;
    const res = { json: payload => { value = payload; return res; } };
    const req = { headers: { token } };
    let nextCalled = false;
    await middleware(req, res, () => { nextCalled = true; });
    return { req, response: value, nextCalled };
};

test("invalid and expired company tokens are rejected", async () => {
    const missing = await call(auth.companies, undefined);
    assert.equal(missing.response.message, "TOKEN_COMPANY_NOT_PROVIDED");
    const bad = await call(auth.companies, "invalid");
    assert.equal(bad.response.message, "CANNOT_VERIFY_TOKEN_COMPANY");
    const expired = jwt.sign({ data: "admin" }, secret, { expiresIn: -1 });
    const rejected = await call(auth.companies, expired);
    assert.equal(rejected.response.message, "CANNOT_VERIFY_TOKEN_COMPANY");
});

test("company tokens must match the stored current token", async () => {
    const original = Company.findById;
    const valid = jwt.sign({ data: "company-1" }, secret, { expiresIn: "1h" });
    try {
        Company.findById = async () => ({ _id: "company-1", currentValidToken: "another-session" });
        const revoked = await call(auth.companies, valid);
        assert.equal(revoked.response.message, "COMPANY_NOT_LOGGED");
        assert.equal(revoked.nextCalled, false);
        Company.findById = async () => ({ _id: "company-1", currentValidToken: valid });
        const allowed = await call(auth.companies, valid);
        assert.equal(allowed.nextCalled, true);
        assert.equal(allowed.req.company._id, "company-1");
    } finally {
        Company.findById = original;
    }
});

test("administrators cannot be authenticated as employees", async () => {
    const admin = jwt.sign({ data: "admin" }, secret, { expiresIn: "1h" });
    const checked = await call(auth.employees, admin);
    assert.equal(checked.response.message, "CANNOT_VERIFY_TOKEN_EMPLOYEE");
});

test("employee sessions require a current token and approval", async () => {
    const original = Employee.findById;
    const token = jwt.sign({ data: "employee-1" }, secret, { expiresIn: "1h" });
    try {
        Employee.findById = async () => ({ currentValidToken: token, companyManagement: "pending" });
        const pending = await call(auth.employees, token);
        assert.equal(pending.response.message, "EMPLOYEE_NOT_ACTIVATED");
        Employee.findById = async () => ({ currentValidToken: token, companyManagement: "accepted" });
        const approved = await call(auth.employees, token);
        assert.equal(approved.nextCalled, true);
    } finally {
        Employee.findById = original;
    }
});
