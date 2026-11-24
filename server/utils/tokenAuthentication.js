"use strict";

const jwt = require("jsonwebtoken");
const Company = require("../models/companies");
const Employee = require("../models/employees");

const verifyToken = token => {
    if(!token || typeof token !== "string") return null;
    try {
        return jwt.verify(token, process.env.AUTH_SECRET_ENCODING_PASSPHRASE);
    } catch (_) {
        return null;
    }
};

const companies = async (req, res, next) => {
    const token = req.headers.token;
    if(!token) return res.json({ message: "TOKEN_COMPANY_NOT_PROVIDED" });
    const payload = verifyToken(token);
    if(!payload || !payload.data) return res.json({ message: "CANNOT_VERIFY_TOKEN_COMPANY" });

    if(payload.data === "admin") {
        req.admin = true;
        return next();
    }
    try {
        const company = await Company.findById(payload.data);
        if(!company) return res.json({ message: "NO_COMPANY_ACCOUNT" });
        if(company.currentValidToken !== token) return res.json({ message: "COMPANY_NOT_LOGGED" });
        req.company = company;
        return next();
    } catch (_) {
        return res.json({ message: "CANNOT_VERIFY_TOKEN_COMPANY" });
    }
};

const employees = async (req, res, next) => {
    const token = req.headers.token;
    if(!token) return res.json({ message: "TOKEN_EMPLOYEE_NOT_PROVIDED" });
    const payload = verifyToken(token);
    if(!payload || !payload.data || payload.data === "admin")
        return res.json({ message: "CANNOT_VERIFY_TOKEN_EMPLOYEE" });
    try {
        const employee = await Employee.findById(payload.data);
        if(!employee) return res.json({ message: "NO_EMPLOYEE_ACCOUNT" });
        if(employee.currentValidToken !== token) return res.json({ message: "EMPLOYEE_NOT_LOGGED" });
        if(employee.companyManagement !== "accepted") return res.json({ message: "EMPLOYEE_NOT_ACTIVATED" });
        req.employee = employee;
        return next();
    } catch (_) {
        return res.json({ message: "CANNOT_VERIFY_TOKEN_EMPLOYEE" });
    }
};

const companyOnly = (req, res, next) =>
    req.company ? next() : res.json({ message: "NOT_COMPANY" });

module.exports = { companies, employees, companyOnly, verifyToken };
