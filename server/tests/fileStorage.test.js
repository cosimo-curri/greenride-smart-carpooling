"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { fileUpload } = require("../utils/fileStorage");

test("uploads create missing directories and write the file", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "greenride-upload-"));
    const destination = path.join(temp, "not-yet-created", "certifications", "test.pdf");
    try {
        const result = await fileUpload(destination, {
            mv: target => fs.writeFile(target, Buffer.from("dummy-content"))
        });
        assert.equal(result.message, "UPLOAD_OK");
        assert.equal(await fs.readFile(destination, "utf8"), "dummy-content");
    } finally {
        await fs.rm(temp, { recursive: true, force: true });
    }
});

test("failed upload is returned as an error rather than success", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "greenride-upload-"));
    try {
        const result = await fileUpload(path.join(temp, "docs", "test.pdf"), {
            mv: async () => { throw new Error("simulated write failure"); }
        });
        assert.equal(result.message, "UPLOAD_ERROR");
    } finally {
        await fs.rm(temp, { recursive: true, force: true });
    }
});
