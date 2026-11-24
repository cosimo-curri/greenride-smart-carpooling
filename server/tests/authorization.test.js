"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { sameId, belongsToCompany, ownsOffer, isSafeFilename } = require("../utils/authorization");

test("sameId matches IDs represented as strings or objects", () => {
    const id = "507f1f77bcf86cd799439011";
    assert.equal(sameId(id, { toString: () => id }), true);
    assert.equal(sameId(id, "507f1f77bcf86cd799439012"), false);
    assert.equal(sameId(null, id), false);
});

test("tenant checks reject other company employees", () => {
    assert.equal(belongsToCompany({ company: "tenant-a" }, "tenant-a"), true);
    assert.equal(belongsToCompany({ company: "tenant-b" }, "tenant-a"), false);
    assert.equal(belongsToCompany(null, "tenant-a"), false);
});

test("offer ownership works with populated or bare employee IDs", () => {
    assert.equal(ownsOffer({ employee: "author" }, "author"), true);
    assert.equal(ownsOffer({ employee: { _id: "author" } }, "author"), true);
    assert.equal(ownsOffer({ employee: "other" }, "author"), false);
});

test("protected filenames reject traversal and unknown extensions", () => {
    const valid = "657dad96-6ac5-4785-883b-bd06540a4869.pdf";
    assert.equal(isSafeFilename(valid, [".pdf"]), true);
    assert.equal(isSafeFilename("../../" + valid, [".pdf"]), false);
    assert.equal(isSafeFilename(valid.replace(".pdf", ".exe"), [".pdf"]), false);
});
