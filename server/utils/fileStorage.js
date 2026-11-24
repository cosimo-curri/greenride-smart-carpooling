"use strict";
const fs = require("node:fs/promises");
const path = require("node:path");

const fileUpload = async (destination, file) => {
    try {
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await file.mv(destination);
        return { message: "UPLOAD_OK" };
    } catch (_) {
        return { message: "UPLOAD_ERROR" };
    }
};

module.exports = { fileUpload };
