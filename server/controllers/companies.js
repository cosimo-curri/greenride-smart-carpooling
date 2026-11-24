const passport = require("passport");
const Company = require("../models/companies");

const helpers = require("../utils/helpers");

const jsonWebToken = require("jsonwebtoken");
const { validationResult } = require("express-validator");

//THE SECRET ENCODING PASSPHRASE IS DIFFERENT FOR THE LOGIN
exports.signup = (req, res, next) => {
    const { name, VAT, email, password, headquartersCoordinates, logoFilename } = req.body;

    if(name && VAT && email && password && headquartersCoordinates && logoFilename) {
        const errors = validationResult(req);

        if(errors.errors[0])
            res.json({ message: errors.errors[0].msg });
        else if(!helpers.validateCoordinates(headquartersCoordinates.coordinates))
            res.json({ message: "COORDINATES_ERROR" });
        else {
            let activationToken = jsonWebToken.sign({
                data: email
            }, process.env.COMPANY_ACTIVATION_TOKEN_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });

            //FOR THE NEXT MIDDLEWARE
            req.body.activationToken = activationToken;

            const newCompany = new Company({
                name: name,
                VAT: VAT,
                email: email,
                headquartersCoordinates: headquartersCoordinates,
                logoURL: `${process.env.BASE_URL}/logos/${logoFilename}`,
                secureSignUp: {
                    activationToken: activationToken
                }
            });
        
            Company.register(newCompany, password, (error, company) => {
                if(company)
                    next();
                else
                    res.json({ message: error.name }); //UserExistsError USERNAME USED, MongoServerError E-MAIL USED, ValidationError WHEN IS NOT PROVIDED REQUIRED DATA
            });
        }
    } else
        res.json({ message: "COMPANY_SIGNUP_ERROR" });
};

//SETTING secureSignUp.activationToken TO undefined INSTEAD OF null ALLOWS TO DELETE THE ATTRIBUTE FROM THE DOCUMENT
//CHECK ON findOneAndUpdate WITHOUT USING .then AND .catch FOR CODING CONVENIENCE
exports.active = (req, res) => {
    try {
        jsonWebToken.verify(req.params.activationToken, process.env.COMPANY_ACTIVATION_TOKEN_SECRET_ENCODING_PASSPHRASE);
    } catch (_) {
        return res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/error`);
    }
    Company.findOne({ "secureSignUp.activationToken": req.params.activationToken })
        .then(async c => {
            if(c) {
                await Company.findOneAndUpdate({ _id: c._id }, {
                    "secureSignUp.activationToken": null, "secureSignUp.active": true
                });

                res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/?signupstatus=ok`);
            } else
                res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/error`);
        })
        .catch(() => res.redirect(`${process.env.BASE_URL_CLIENT_COMPANY}/error`));
};

//CHECK ON findOne WITHOUT USING .then AND .catch FOR CODING CONVENIENCE
//IF I DON'T SEND THE JSON WITH THE COMPANY INFO THE SERVER CAN'T RESPONDE WITH THE HEADER Set-Cookie SO THE CLIENT CAN'T BE LOGGED
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    if(email && password) {
        if(
            email === process.env.ADMIN_GREENRIDE_EMAIL &&
            password === process.env.ADMIN_GREENRIDE_PASSWORD
        ) {
            const adminToken = jsonWebToken.sign({
                data: "admin"
            }, process.env.AUTH_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });

            return res.json({
                message: "ADMIN_SIGNIN_OK",
                company: {
                    name: "GreenRide",
                    email: process.env.ADMIN_GREENRIDE_EMAIL,
                    isAdmin: true
                },
                token: adminToken
            });
        }

        req.body.username = email; //ACCESS WITH E-MAIL INSTEAD OF USERNAME

        passport.authenticate("local", async (_, company) => {
            if(company) {
                if(company.secureSignUp.active && company.secureSignUp.adminActivation) {
                    let signedToken = jsonWebToken.sign({
                        data: company._id
                    }, process.env.AUTH_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });
        
                    await helpers.changeCurrentToken(company._id, signedToken);
                    
                    const dataJSON = {
                        message: "COMPANY_SIGNIN_OK",
                        company: { ...helpers.clientFilterCompany(company), isAdmin: false }, // Explicit role marker; backend enforces actual privileges.
                        token: signedToken
                    };

                    res.json(dataJSON);
                } else
                    res.json({ message: "COMPANY_SIGNIN_NOT_ACTIVE" });
            } else
                res.json({ message: "COMPANY_SIGNIN_NOT_FOUND" });
        })(req, res);
    } else
        res.json({ message: "COMPANY_SIGNIN_ERROR" });
};

exports.logout = async (req, res) => {
    const token = req.headers.token;
    const companyId = req.headers.companyid;
    if(!companyId || !token) return res.json({ message: "COMPANY_ID_NOT_PROVIDED" });
    try {
        const { verifyToken } = require("../utils/tokenAuthentication");
        const payload = verifyToken(token);
        if(!payload || String(payload.data) !== String(companyId))
            return res.json({ message: "COMPANY_NOT_LOGGED" });
        const company = await Company.findById(companyId);
        if(!company || company.currentValidToken !== token)
            return res.json({ message: "COMPANY_NOT_LOGGED" });
        await helpers.invalidToken(companyId);
        return res.json({ message: "COMPANY_LOGOUT_OK" });
    } catch (_) {
        return res.json({ message: "COMPANY_NOT_LOGGED" });
    }
};

exports.getAllPendingSignUpRequests = (req, res) => {
    if(req.admin) {
        Company.find({
            "secureSignUp.active": true,
            "secureSignUp.adminActivation": false
        })
        .then(companies => {
            const clientFilteredCompanies = companies.map(company => helpers.clientFilterCompany(company));
            
            res.json({
                message: "GET_ALL_PENDING_SIGN_UP_REQUESTS_COMPANY_OK",
                companies: clientFilteredCompanies
            });
        })
        .catch(() => res.json({ message: "GET_ALL_PENDING_SIGN_UP_REQUESTS_COMPANY_ERROR" }));
    } else
        res.json({ message: "NOT_ADMIN" });
};

exports.acceptCompany = (req, res) => {
    if(req.admin) {
        const { companyId } = req.body;

        if(companyId) {
            Company.findByIdAndUpdate(
                companyId,
                { "secureSignUp.adminActivation": true }
            )
            .then(() => res.json({ message: "ACCEPT_COMPANY_OK" }))
            .catch(() => res.json({ message: "ACCEPT_COMPANY_ERROR" }));
        } else
            res.json({ message: "ACCEPT_COMPANY_ERROR" });
    } else
        res.json({ message: "NOT_ADMIN" });
};

exports.rejectCompany = (req, res) => {
    if(req.admin) {
        const { companyId } = req.body;

        if(companyId) {
            Company.findByIdAndDelete(companyId)
                .then(() => res.json({ message: "REJECT_COMPANY_OK" }))
                .catch(() => res.json({ message: "REJECT_COMPANY_ERROR" }));
        } else
            res.json({ message: "REJECT_COMPANY_ERROR" });
    } else
        res.json({ message: "NOT_ADMIN" });
};

exports.getAllCompanies = (_, res) => {
    Company.find({}, {
        name: 1,
        headquartersCoordinates: 1
    })
    .then(companies => res.json({ message: "GET_ALL_COMPANIES_OK", companies: companies }))
    .catch(() => res.json({ message: "GET_ALL_COMPANIES_ERROR" }));
};