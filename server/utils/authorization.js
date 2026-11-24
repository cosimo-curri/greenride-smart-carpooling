"use strict";

const sameId = (left, right) => Boolean(left && right && String(left) === String(right));

const belongsToCompany = (employee, companyId) =>
    Boolean(employee && sameId(employee.company, companyId));

const ownsOffer = (offer, employeeId) =>
    Boolean(offer && sameId(offer.employee?._id || offer.employee, employeeId));

const isSafeFilename = (filename, extensions) =>
    typeof filename === "string" &&
    /^[0-9a-f-]{36}\.[a-z0-9]+$/i.test(filename) &&
    extensions.some(extension => filename.toLowerCase().endsWith(extension));

module.exports = { sameId, belongsToCompany, ownsOffer, isSafeFilename };
