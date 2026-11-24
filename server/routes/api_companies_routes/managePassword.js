const express = require("express");
const router = express.Router();

const Company = require("../../models/companies");

const jsonWebToken = require("jsonwebtoken");

const nodemailer = require("../../utils/nodemailer");

const validators = require("../../utils/validators");
const { validationResult } = require("express-validator");

//Persist the reset token before sending the email, so every delivered link is usable.
router.post("/requestRestorePassword", async (req, res, next) => {
    const { email } = req.body;

    if(!email)
        return res.json({ message: "RESTORE_PASSWORD_COMPANY_ERROR" });

    try {
        const company = await Company.findOne({ email: email });
        if(!company)
            return res.json({ message: "COMPANY_NOT_FOUND" });

        const changePasswordToken = jsonWebToken.sign({
            data: email
        }, process.env.COMPANY_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });

        company.changePasswordToken = changePasswordToken;
        await company.save();

        req.body.changePasswordToken = changePasswordToken;
        return next();
    } catch (_) {
        return res.json({ message: "RESTORE_PASSWORD_COMPANY_ERROR" });
    }
}, nodemailer.changePasswordRequest);

router.get("/restorePassword/:changePasswordToken", (req, res) => {
    try {
        jsonWebToken.verify(req.params.changePasswordToken, process.env.COMPANY_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE);
    } catch (_) {
        return res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/error`);
    }
    Company.findOne({ changePasswordToken: req.params.changePasswordToken })
        .then(c => {
            if(c)
                res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/restore-password?changePasswordToken=${req.params.changePasswordToken}`);
            else
                res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/error`);
        })
        .catch(() => res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/error`));
});

//Validate and persist the new password before confirming a successful reset.
router.post("/restorePassword", (req, res, next) => {
    const { changePasswordToken, password1, password2 } = req.body;

    if(changePasswordToken && password1 && password2 && password1 === password2) {
        req.body.password = password1;
        return next();
    }

    return res.json({ message: "RESTORE_PASSWORD_COMPANY_ERROR" });
}, validators.strongPasswordValidator, async (req, res) => {
    const { changePasswordToken, password } = req.body;
    const errors = validationResult(req);
    const responseJSON = errors.errors.map(element => ({ message: element.msg }));

    if(responseJSON.length > 0)
        return res.json(responseJSON);

    try {
        jsonWebToken.verify(changePasswordToken, process.env.COMPANY_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE);
        const company = await Company.findOne({ changePasswordToken: changePasswordToken });

        if(!company)
            return res.json({ message: "RESTORE_PASSWORD_COMPANY_ERROR" });

        await company.setPassword(password);
        company.changePasswordToken = null;
        await company.save();

        return res.json({ message: "RESTORE_PASSWORD_COMPANY_OK" });
    } catch (_) {
        return res.json({ message: "RESTORE_PASSWORD_COMPANY_ERROR" });
    }
});

module.exports = router;
