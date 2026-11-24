"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { tenantOffersOnly, forRanking, restoreRankedOffers } = require("../utils/llmOffers");

const validOffer = {
    _id: "offer-1", employee: { _id: "driver-1", company: "tenant-a", username: "driver", notificationToken: "private-token" },
    departureDate: "21/11/2026", departureTime: "09:00", freeSeats: 2,
    otherInfo: "Quiet drive", pendingRequests: [{ employeeRequestId: "passenger-id" }],
    userDistance: "1 km", userMinutesDistance: 10
};

test("tenant filter removes null-populated and unrelated offers", () => {
    const sameTenant = { ...validOffer };
    const otherTenant = { ...validOffer, _id: "other", employee: { company: "tenant-b" } };
    const unmatched = { ...validOffer, _id: "unmatched", employee: null };
    assert.deepEqual(tenantOffersOnly([sameTenant, otherTenant, unmatched], "tenant-a"), [sameTenant]);
});

test("third-party ranking payload excludes notification tokens, passenger data and account IDs", () => {
    const payload = forRanking(validOffer);
    assert.equal(payload._id, "offer-1");
    assert.equal(payload.userMinutesDistance, 10);
    assert.equal(payload.employee, undefined);
    assert.equal(payload.notificationToken, undefined);
    assert.equal(payload.pendingRequests, undefined);
});

test("model can only rank authorized offer IDs, not fabricate content", () => {
    const sorted = restoreRankedOffers([
        { _id: "other", reason: "Injected", freeSeats: 99 },
        { _id: "offer-1", reason: "Good fit.", freeSeats: 99, notificationToken: "evil" },
        { _id: "offer-1", reason: "Duplicate." }
    ], [validOffer]);
    assert.equal(sorted.length, 1);
    assert.equal(sorted[0].reason, "Good fit.");
    assert.equal(sorted[0].freeSeats, 2);
    assert.equal(sorted[0].employee.username, "driver");
});
