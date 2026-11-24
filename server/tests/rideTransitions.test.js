"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Offer = require("../models/offers");
const Employee = require("../models/employees");
const GreenInfo = require("../models/greenInfo");
const helpers = require("../utils/helpers");
const controller = require("../controllers/offers");

const invoke = async (action, body, employee = { _id: "driver", company: "team" }) => {
    let payload;
    await action({ body, employee }, { json: data => { payload = data; return data; } });
    return payload;
};

test("ride acceptance claims the pending request and seat in one conditional update", async () => {
    const initialFind = Offer.findById;
    const initialUpdate = Offer.findOneAndUpdate;
    const initialNotify = helpers.sendEmployeeAppNotification;
    const notificationRecipient = {
        _id: "passenger", company: "team", notificationToken: null,
        updateOne: async () => ({ modifiedCount: 1 })
    };
    const pending = {
        _id: "request", status: "pending", employeeRequestId: notificationRecipient,
        intermediateStop: { type: "Point", coordinates: [11, 42] }
    };
    const offer = {
        _id: "offer", employee: "driver", freeSeats: 1, closed: false,
        pendingRequests: { id: key => key === "request" ? pending : null }
    };
    let claimed = false;
    let claims = 0;
    Offer.findById = () => ({ populate: async () => offer });
    Offer.findOneAndUpdate = async (filter, update) => {
        assert.equal(filter.closed, false);
        assert.deepEqual(filter.freeSeats, { $gt: 0 });
        assert.deepEqual(filter.pendingRequests.$elemMatch, { _id: "request", status: "pending" });
        assert.equal(update.$inc.freeSeats, -1);
        assert.equal(update.$set["pendingRequests.$.status"], "accepted");
        assert.equal(update.$set.distance, 7.5);
        assert.equal(update.$push.intermediateStops, pending.intermediateStop);
        claims++;
        if(claimed) return null;
        claimed = true;
        return { _id: "offer" };
    };
    helpers.sendEmployeeAppNotification = async () => undefined;
    try {
        const answers = await Promise.all([
            invoke(controller.acceptPendingRequest, { offerId: "offer", pendingRequestId: "request", distance: "7.5 km" }),
            invoke(controller.acceptPendingRequest, { offerId: "offer", pendingRequestId: "request", distance: "7.5 km" })
        ]);
        assert.equal(answers.filter(a => a.message === "ACCEPT_PENDING_REQUEST_OK").length, 1);
        assert.equal(answers.filter(a => a.message === "ACCEPT_PENDING_REQUEST_ERROR").length, 1);
        assert.equal(claims, 2);
    } finally {
        Offer.findById = initialFind;
        Offer.findOneAndUpdate = initialUpdate;
        helpers.sendEmployeeAppNotification = initialNotify;
    }
});

test("failed carbon-estimate provider does not close the offer or award Green Points", async () => {
    const initialFind = Offer.findOne;
    const initialUpdate = Offer.findOneAndUpdate;
    const initialScore = Employee.updateOne;
    const initialLLM = helpers.sendLLM;
    const initialGreenInfo = GreenInfo.updateOne;
    const initialPoints = helpers.calculateGreenPoints;
    const events = [];
    Offer.findOne = async () => ({
        _id: "offer", employee: "driver", distance: 10,
        pendingRequests: [{ status: "accepted" }]
    });
    Offer.findOneAndUpdate = async () => { events.push("close"); return {}; };
    Employee.updateOne = async () => { events.push("points"); };
    GreenInfo.updateOne = async () => { events.push("green-info"); };
    helpers.calculateGreenPoints = () => 10;
    helpers.sendLLM = async () => { events.push("provider"); throw new Error("offline"); };
    try {
        const response = await invoke(controller.closeOffer, { offerId: "offer" });
        assert.equal(response.message, "CLOSE_OFFER_ERROR");
        assert.deepEqual(events, ["provider"]);
    } finally {
        Offer.findOne = initialFind;
        Offer.findOneAndUpdate = initialUpdate;
        Employee.updateOne = initialScore;
        GreenInfo.updateOne = initialGreenInfo;
        helpers.calculateGreenPoints = initialPoints;
        helpers.sendLLM = initialLLM;
    }
});

test("ride closure credits points only when its conditional claim succeeds", async () => {
    const initialFind = Offer.findOne;
    const initialUpdate = Offer.findOneAndUpdate;
    const initialScore = Employee.updateOne;
    const initialLLM = helpers.sendLLM;
    const initialGreenInfo = GreenInfo.updateOne;
    const initialPoints = helpers.calculateGreenPoints;
    const events = [];
    Offer.findOne = async () => ({
        _id: "offer", employee: "driver", distance: 20,
        pendingRequests: [{ status: "accepted" }]
    });
    let claimed = false;
    Offer.findOneAndUpdate = async (query, change) => {
        assert.equal(query.closed, false);
        assert.equal(change.$set.closed, true);
        if(claimed) return null;
        claimed = true;
        events.push("close");
        return {};
    };
    Employee.updateOne = async (_, change) => { events.push("points"); assert.equal(change.$inc.greenPoints, 4); };
    GreenInfo.updateOne = async (_, change) => { events.push("carbon"); assert.equal(change.$inc.totalSavedCO2, 2.3); };
    helpers.calculateGreenPoints = () => 4;
    helpers.sendLLM = async () => ({ choices: [{ message: { content: '{"savedCO2":2.3}' } }] });
    try {
        const response = await invoke(controller.closeOffer, { offerId: "offer" });
        assert.equal(response.message, "CLOSE_OFFER_OK");
        assert.equal(response.savedCO2, 2.3);
        assert.deepEqual(events, ["close", "points", "carbon"]);
        const duplicate = await invoke(controller.closeOffer, { offerId: "offer" });
        assert.equal(duplicate.message, "CLOSE_OFFER_ERROR");
        assert.deepEqual(events, ["close", "points", "carbon"]);
    } finally {
        Offer.findOne = initialFind;
        Offer.findOneAndUpdate = initialUpdate;
        Employee.updateOne = initialScore;
        GreenInfo.updateOne = initialGreenInfo;
        helpers.calculateGreenPoints = initialPoints;
        helpers.sendLLM = initialLLM;
    }
});

test("ride rejection is conditional on the request still being pending", async () => {
    const initialFind = Offer.findById;
    const initialUpdate = Offer.findOneAndUpdate;
    const initialNotify = helpers.sendEmployeeAppNotification;
    const pending = {
        status: "pending", employeeRequestId: { _id: "passenger", company: "team", notificationToken: null,
            updateOne: async () => ({ modifiedCount: 1 }) }
    };
    Offer.findById = () => ({ populate: async () => ({
        closed: false, employee: "driver", pendingRequests: { id: id => id === "request" ? pending : null }
    }) });
    let accepted = false;
    Offer.findOneAndUpdate = async (query, update) => {
        assert.deepEqual(query.pendingRequests.$elemMatch, { _id: "request", status: "pending" });
        assert.equal(update.$set["pendingRequests.$.status"], "rejected");
        if(accepted) return null;
        accepted = true;
        return {};
    };
    helpers.sendEmployeeAppNotification = () => undefined;
    try {
        const first = await invoke(controller.rejectPendingRequest, { offerId: "offer", pendingRequestId: "request" });
        const duplicate = await invoke(controller.rejectPendingRequest, { offerId: "offer", pendingRequestId: "request" });
        assert.equal(first.message, "REJECT_PENDING_REQUEST_OK");
        assert.equal(duplicate.message, "REJECT_PENDING_REQUEST_ERROR");
    } finally {
        Offer.findById = initialFind;
        Offer.findOneAndUpdate = initialUpdate;
        helpers.sendEmployeeAppNotification = initialNotify;
    }
});
