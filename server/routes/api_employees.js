const express = require("express");
const router = express.Router();

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Employee = require("../models/employees");
const employeesController = require("../controllers/employees");
const companiesController = require("../controllers/companies");

const validators = require("../utils/validators");

//ROUTERS
const fileRouter = require("./common/file");

////////////////////////////////////////////////////////////////////////////////
/// NOT USING req.isAuthenticated(), req.user, ETC. WITHOUT TOKEN VALIDATION ///
////////////////////////////////////////////////////////////////////////////////

passport.use("local-employee", new LocalStrategy(Employee.authenticate()));
passport.serializeUser(Employee.serializeUser()); //PASSPORT SERIALIZES THE MODEL "Employee", ENCRYPTS IT AND SENDS IT FOR COOKIES-STORAGE
passport.deserializeUser(Employee.deserializeUser()); //PASSPORT DESERIALIZES AND VERIFIES THE MODEL "Employee" SENT BY THE CLIENT TO THE SERVER

router.use("/file", fileRouter);

router.get("/getAllCompanies", companiesController.getAllCompanies);

router.post("/signup", validators.strongPasswordValidator, employeesController.signup);
router.post("/signin", employeesController.signin);
router.get("/logout", employeesController.logout);

module.exports = router;