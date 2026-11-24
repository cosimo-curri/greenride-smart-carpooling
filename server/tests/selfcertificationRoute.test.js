"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const Selfcertification = require("../models/selfcertifications");
const mail = require("../utils/nodemailer");
const helpers = require("../utils/helpers");
const router = require("../routes/common/file");

const storage = path.join(__dirname, "..", "greenride_cloud_storage", "selfcertifications");

async function requestWithPdf(server) {
    const body = new FormData();
    body.append("files", new Blob(["%PDF-1.4\ntest"], { type: "application/pdf" }), "fake-certificate.pdf");
    const response = await fetch(`http://127.0.0.1:${server.address().port}/uploadSelfcertifications`, {
        method: "POST", headers: { employeeid: "current-employee" }, body
    });
    return response.json();
}

test("self-certification route creates missing directory; failed uploads do not save DB records", async () => {
    const originalSave = Selfcertification.prototype.save;
    const originalMail = mail.sendEmployeeNewSelfcertificationCommunication;
    const originalUpload = helpers.fileUpload;
    const originalBaseUrl = process.env.BASE_URL;
    const app = express();
    app.use((req, _, next) => { req.employee = { _id: "current-employee" }; next(); });
    app.use(router);
    const server = app.listen(0, "127.0.0.1");
    let saved = 0;
    Selfcertification.prototype.save = async function() { saved++; return this; };
    mail.sendEmployeeNewSelfcertificationCommunication = async () => {};
    process.env.BASE_URL = "http://localhost:3000";
    try {
        await new Promise(resolve => server.once("listening", resolve));
        await fs.rm(storage, { recursive: true, force: true });
        const successful = await requestWithPdf(server);
        assert.equal(successful.message, "UPLOAD_SELFCERTIFICATIONS_OK");
        assert.equal(saved, 1);
        assert.equal((await fs.readdir(storage)).length, 1);

        helpers.fileUpload = async () => ({ message: "UPLOAD_ERROR" });
        const failed = await requestWithPdf(server);
        assert.equal(failed.message, "UPLOAD_SELFCERTIFICATIONS_ERROR");
        assert.equal(saved, 1);
        assert.equal((await fs.readdir(storage)).length, 1);

        // The stored files must also be rolled back if the database write fails.
        helpers.fileUpload = originalUpload;
        Selfcertification.prototype.save = async () => { throw new Error("database down"); };
        const failedDb = await requestWithPdf(server);
        assert.equal(failedDb.message, "UPLOAD_SELFCERTIFICATIONS_ERROR");
        assert.equal((await fs.readdir(storage)).length, 1);
    } finally {
        await new Promise(resolve => server.close(resolve));
        Selfcertification.prototype.save = originalSave;
        mail.sendEmployeeNewSelfcertificationCommunication = originalMail;
        helpers.fileUpload = originalUpload;
        if(originalBaseUrl === undefined) delete process.env.BASE_URL;
        else process.env.BASE_URL = originalBaseUrl;
        await fs.rm(storage, { recursive: true, force: true });
    }
});
