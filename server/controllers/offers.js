const mongoose = require("mongoose");
const Offer = require("../models/offers");
const GreenInfo = require("../models/greenInfo");

const helpers = require("../utils/helpers");
const { sameId, ownsOffer, belongsToCompany } = require("../utils/authorization");

exports.savePendingRequest = async (req, res) => {
    const { isDefault, coords, offerId, employeeRequestId } = req.body;

    if(isDefault != null && offerId && sameId(employeeRequestId, req.employee._id)) {
        if(!isDefault && !coords)
            return res.json({ message: "SAVE_PENDING_REQUEST_ERROR" });

        try {
            const newPendingRequest =
                isDefault
                ?
                {
                    isDefault: true,
                    intermediateStop: {
                        type: "Point",
                        coordinates: [0, 0]
                    },
                    status: "pending",
                    employeeRequestId: employeeRequestId
                }
                :
                {
                    isDefault: false,
                    intermediateStop: {
                        type: "Point",
                        coordinates: [coords.longitude, coords.latitude]
                    },
                    status: "pending",
                    employeeRequestId: employeeRequestId
                };

            const existingOffer = await Offer.findById(offerId).populate("employee");
            if(!existingOffer || !existingOffer.employee || existingOffer.closed || existingOffer.freeSeats <= 0 ||
                !belongsToCompany(existingOffer.employee, req.employee.company) ||
                ownsOffer(existingOffer, req.employee._id) ||
                existingOffer.pendingRequests.some(request => sameId(request.employeeRequestId, req.employee._id) && request.status !== "rejected"))
                return res.json({ message: "SAVE_PENDING_REQUEST_ERROR" });

            const updatedOffer = await Offer.findOneAndUpdate(
                {
                    _id: offerId, closed: false, freeSeats: { $gt: 0 },
                    pendingRequests: { $not: { $elemMatch: {
                        employeeRequestId: req.employee._id, status: { $ne: "rejected" }
                    } } }
                },
                { $push: { pendingRequests: newPendingRequest } },
                { runValidators: true, new: true }
            ).populate("employee");

            if(!updatedOffer)
                return res.json({ message: "SAVE_PENDING_REQUEST_ERROR" });

            const titleNotification = "Hey! You've Got a New Request!";
            const messageNotification = "A fresh request just landed for you! Jump in and see what's cooking!";

            updatedOffer.employee.notifications.push({
                title: titleNotification,
                message: messageNotification
            });

            await updatedOffer.employee.save();

            helpers.sendEmployeeAppNotification(updatedOffer.employee.notificationToken, titleNotification, messageNotification);

            res.json({ message: "SAVE_PENDING_REQUEST_OK" });
        } catch(_) {
            res.json({ message: "SAVE_PENDING_REQUEST_ERROR" });
        }
    } else
        res.json({ message: "SAVE_PENDING_REQUEST_ERROR" });
};

exports.acceptPendingRequest = async (req, res) => {
    const { offerId, pendingRequestId } = req.body;
    let distance = req.body.distance;

    if(offerId && pendingRequestId && distance) {
        try {
            const offer = await Offer.findById(offerId).populate("pendingRequests.employeeRequestId");

            if(!offer || offer.freeSeats <= 0 || offer.closed || !ownsOffer(offer, req.employee._id))
                return res.json({ message: "ACCEPT_PENDING_REQUEST_ERROR" });

            const pendingRequest = offer.pendingRequests.id(pendingRequestId);

            if(!pendingRequest || pendingRequest.status !== "pending" ||
                !pendingRequest.employeeRequestId ||
                !belongsToCompany(pendingRequest.employeeRequestId, req.employee.company))
                return res.json({ message: "ACCEPT_PENDING_REQUEST_ERROR" });

            const distanceKm = typeof distance === "string"
                ? Number(distance.replace(/\s*km\s*$/i, ""))
                : Number(distance);
            if(!Number.isFinite(distanceKm) || distanceKm < 0)
                return res.json({ message: "ACCEPT_PENDING_REQUEST_ERROR" });

            // Claim the still-pending request and seat in one MongoDB document update.
            // This prevents concurrent drivers' actions from overselling a seat or
            // accepting the same request twice.
            const update = {
                $inc: { freeSeats: -1 },
                $set: { "pendingRequests.$.status": "accepted", distance: distanceKm }
            };
            if(pendingRequest.intermediateStop)
                update.$push = { intermediateStops: pendingRequest.intermediateStop };

            const acceptedOffer = await Offer.findOneAndUpdate({
                _id: offerId,
                employee: req.employee._id,
                closed: false,
                freeSeats: { $gt: 0 },
                pendingRequests: { $elemMatch: { _id: pendingRequestId, status: "pending" } }
            }, update, { new: true, runValidators: true });
            if(!acceptedOffer)
                return res.json({ message: "ACCEPT_PENDING_REQUEST_ERROR" });

            const titleNotification = "Woohoo! Ride Request Approved!";
            const messageNotification = "Jump into the app section and check it out!";

            await pendingRequest.employeeRequestId.updateOne({
                $push: { notifications: { title: titleNotification, message: messageNotification } }
            });

            helpers.sendEmployeeAppNotification(pendingRequest.employeeRequestId.notificationToken, titleNotification, messageNotification);

            res.json({ message: "ACCEPT_PENDING_REQUEST_OK" });
        } catch(_) {
            res.json({ message: "ACCEPT_PENDING_REQUEST_ERROR" });
        }
    } else
        res.json({ message: "ACCEPT_PENDING_REQUEST_ERROR" });
};

exports.rejectPendingRequest = async (req, res) => {
    const { offerId, pendingRequestId } = req.body;

    if(offerId && pendingRequestId) {
        try {
            const offer = await Offer.findById(offerId).populate("pendingRequests.employeeRequestId");

            if(!offer || offer.closed || !ownsOffer(offer, req.employee._id))
                return res.json({ message: "REJECT_PENDING_REQUEST_ERROR" });

            const pendingRequest = offer.pendingRequests.id(pendingRequestId);

            if(!pendingRequest || pendingRequest.status !== "pending" ||
                !pendingRequest.employeeRequestId ||
                !belongsToCompany(pendingRequest.employeeRequestId, req.employee.company))
                return res.json({ message: "REJECT_PENDING_REQUEST_ERROR" });

            const rejected = await Offer.findOneAndUpdate({
                _id: offerId,
                employee: req.employee._id,
                closed: false,
                pendingRequests: { $elemMatch: { _id: pendingRequestId, status: "pending" } }
            }, { $set: { "pendingRequests.$.status": "rejected" } }, { new: true });
            if(!rejected)
                return res.json({ message: "REJECT_PENDING_REQUEST_ERROR" });

            const titleNotification = "Oops! Ride Request Not Approved!";
            const messageNotification = "Hop back into the app section to see what's up!";

            await pendingRequest.employeeRequestId.updateOne({
                $push: { notifications: { title: titleNotification, message: messageNotification } }
            });

            helpers.sendEmployeeAppNotification(pendingRequest.employeeRequestId.notificationToken, titleNotification, messageNotification);

            res.json({ message: "REJECT_PENDING_REQUEST_OK" });
        } catch(_) {
            res.json({ message: "REJECT_PENDING_REQUEST_ERROR" });
        }
    } else
        res.json({ message: "REJECT_PENDING_REQUEST_ERROR" });
};

exports.closeOffer = async (req, res) => {
    const { offerId } = req.body;
    if(!offerId) return res.json({ message: "CLOSE_OFFER_ERROR" });

    try {
        const offer = await Offer.findOne({
            _id: offerId, employee: req.employee._id, closed: false
        });
        if(!offer) return res.json({ message: "CLOSE_OFFER_ERROR" });

        const acceptedCount = offer.pendingRequests.filter(pr => pr.status === "accepted").length;
        const newGreenPoints = helpers.calculateGreenPoints(acceptedCount, offer.distance);
        let savedCO2;

        // Resolve the optional provider-dependent estimate BEFORE changing persistent state.
        // A provider outage must not leave a closed trip with an error response.
        if(acceptedCount > 0) {
            const prompt = `
                Restituisci esclusivamente un JSON con un unico campo "savedCO2" (arrotondato alle prime 2 cifre decimali) che rappresenta la stima della CO2 risparmiata in chilogrammi grazie a una corsa di carpooling con la distanza e il numero di persone indicati.
                Nella stima tieni in considerazione che X persone trasportate implica che sono stati evitati X-1 veicoli percorrenti la stessa distanza.
                Non aggiungere alcun testo prima o dopo.

                Distanza: ${offer.distance} chilometri
                Persone trasportate: ${acceptedCount + 1}
            `;
            const response = await helpers.sendLLM(prompt, false);
            const content = JSON.parse(helpers.cleanLLMResponseSafe(response.choices[0].message.content));
            if(typeof content.savedCO2 !== "number" || !Number.isFinite(content.savedCO2) || content.savedCO2 < 0)
                return res.json({ message: "CLOSE_OFFER_ERROR" });
            savedCO2 = content.savedCO2;
        }

        // Only one concurrent request can claim an open offer; no double Green Points award.
        const closed = await Offer.findOneAndUpdate({
            _id: offerId, employee: req.employee._id, closed: false
        }, { $set: { closed: true } }, { new: true });
        if(!closed) return res.json({ message: "CLOSE_OFFER_ERROR" });

        const Employee = require("../models/employees");
        await Employee.updateOne({ _id: req.employee._id }, { $inc: { greenPoints: newGreenPoints } });

        if(savedCO2 !== undefined) {
            await GreenInfo.updateOne({}, {
                $inc: { totalDistance: offer.distance, totalSavedCO2: savedCO2 }
            });
            return res.json({ message: "CLOSE_OFFER_OK", newGreenPoints, savedCO2 });
        }
        return res.json({ message: "CLOSE_OFFER_OK", newGreenPoints });
    } catch(_) {
        return res.json({ message: "CLOSE_OFFER_ERROR" });
    }
};
