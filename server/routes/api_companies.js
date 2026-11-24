const express = require("express");
const router = express.Router();

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Company = require("../models/companies");
const companiesController = require("../controllers/companies");

const validators = require("../utils/validators");
const nodemailer = require("../utils/nodemailer");

//ROUTERS
const fileRouter = require("./common/file");
const managePasswordRouter = require("./api_companies_routes/managePassword");

////////////////////////////////////////////////////////////////////////////////
/// NOT USING req.isAuthenticated(), req.user, ETC. WITHOUT TOKEN VALIDATION ///
////////////////////////////////////////////////////////////////////////////////

passport.use(new LocalStrategy(Company.authenticate()));
passport.serializeUser(Company.serializeUser()); //PASSPORT SERIALIZES THE MODEL "Company", ENCRYPTS IT AND SENDS IT FOR COOKIES-STORAGE
passport.deserializeUser(Company.deserializeUser()); //PASSPORT DESERIALIZES AND VERIFIES THE MODEL "Company" SENT BY THE CLIENT TO THE SERVER

router.use("/file", fileRouter); // Public logo signup only; other uploads require a token.
router.use("/managePassword", managePasswordRouter);

router.post("/signup", validators.emailValidator, validators.strongPasswordValidator, companiesController.signup, nodemailer.signupCompanyConfirmEmail);
router.get("/active/:activationToken", companiesController.active);
router.post("/signin", companiesController.signin);
router.get("/logout", companiesController.logout);

module.exports = router;