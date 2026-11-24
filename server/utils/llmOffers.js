"use strict";

const { sameId } = require("./authorization");

// Populating with `match` alone does NOT exclude unrelated parent offers.
const tenantOffersOnly = (offers, companyId) => offers.filter(offer =>
    offer.employee && sameId(offer.employee.company, companyId)
);

// Third-party ranking needs criteria, not account tokens or pending passenger data.
const forRanking = offer => ({
    _id: String(offer._id),
    departureDate: offer.departureDate,
    departureTime: offer.departureTime,
    freeSeats: offer.freeSeats,
    otherInfo: offer.otherInfo,
    userDistance: offer.userDistance,
    userMinutesDistance: offer.userMinutesDistance
});

// Only trust the order and textual explanation from the model, never its objects.
const restoreRankedOffers = (modelRanking, authorizedOffers) => {
    if(!Array.isArray(modelRanking)) throw new TypeError("Invalid model ranking");
    const byId = new Map(authorizedOffers.map(offer => [String(offer._id), offer]));
    const seen = new Set();
    return modelRanking.flatMap(item => {
        if(!item || !item._id) return [];
        const id = String(item._id);
        if(!byId.has(id) || seen.has(id)) return [];
        seen.add(id);
        return [{ ...byId.get(id), reason: typeof item.reason === "string" ? item.reason : "" }];
    });
};

module.exports = { tenantOffersOnly, forRanking, restoreRankedOffers };
