"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const Offer = require("../models/offers");
const Employee = require("../models/employees");
const helpers = require("../utils/helpers");
const route = require("../routes/token_api_employees_routes/manageLLM");

test("LLM ride search filters at the DB and never sends other tenants' offers to provider", async () => {
    const originalDistinct = Employee.distinct;
    const originalFind = Offer.find;
    const originalLLM = helpers.sendLLM;
    let capturedFilter;
    let rankingPrompt;
    const sameTenant = {
        _id: "offer-tenant-a", employee: { _id: "driver-a", username: "Alice", company: "tenant-a", notificationToken: "private-push-token" },
        departureDate: "21/11/2026", departureTime: "09:00", freeSeats: 2, pendingRequests: [{ employeeRequestId: "private-passenger" }],
        departureCoordinates: { coordinates: [11, 42] }, intermediateStops: []
    };
    const otherTenant = {
        ...sameTenant, _id: "offer-tenant-b", employee: { _id: "driver-b", username: "Bob", company: "tenant-b" }
    };
    Employee.distinct = async () => ["driver-a", "current-employee"];
    Offer.find = query => {
        capturedFilter = query;
        return { populate: () => ({ lean: async () => [sameTenant, otherTenant] }) };
    };
    helpers.sendLLM = async (prompt, classify) => {
        if(classify) {
            return { choices: [{ message: { content: JSON.stringify({
                promptType: "request", data: { departureType: "default", date: "21/11/2026", time: "09:00" }
            }) } }] };
        }
        rankingPrompt = prompt;
        return { choices: [{ message: { content: JSON.stringify([
            { _id: "offer-tenant-b", reason: "Cross-tenant injection." },
            { _id: "offer-tenant-a", reason: "Compatible trip." }
        ]) } }] };
    };
    const app = express();
    app.use(express.json());
    app.use((req, _, next) => {
        req.employee = { _id: "current-employee", company: "tenant-a", pin: { coordinates: [11, 42] } };
        next();
    });
    app.use(route);
    const server = app.listen(0, "127.0.0.1");
    try {
        await new Promise(resolve => server.once("listening", resolve));
        const response = await fetch(`http://127.0.0.1:${server.address().port}/send`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "Need a ride" })
        });
        const body = await response.json();
        assert.equal(body.message, "SEND_LLM_OFFERS_OK");
        assert.equal(body.data.contentSorting.length, 1);
        assert.equal(body.data.contentSorting[0]._id, "offer-tenant-a");
        assert.equal(body.data.contentSorting[0].employee.username, "Alice");
        assert.deepEqual(capturedFilter.employee.$in, ["driver-a", "current-employee"]);
        assert.equal(capturedFilter.employee.$ne, "current-employee");
        assert.ok(rankingPrompt.includes("offer-tenant-a"));
        assert.ok(!rankingPrompt.includes("offer-tenant-b"));
        assert.ok(!rankingPrompt.includes("private-push-token"));
        assert.ok(!rankingPrompt.includes("private-passenger"));
    } finally {
        await new Promise(resolve => server.close(resolve));
        Employee.distinct = originalDistinct;
        Offer.find = originalFind;
        helpers.sendLLM = originalLLM;
    }
});
