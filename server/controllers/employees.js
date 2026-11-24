const passport = require("passport");
const Employee = require("../models/employees");

const jsonWebToken = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const helpers = require("../utils/helpers");
const nodemailer = require("../utils/nodemailer");

const path = require("path");

//THE SECRET ENCODING PASSPHRASE IS DIFFERENT FOR THE LOGIN
exports.signup = (req, res) => {
    const { defaultFreeSeats, companyId, pin, password } = req.body;

    if(defaultFreeSeats && companyId && pin && password) {
        const errors = validationResult(req);

        if(errors.errors[0])
            res.json({ message: errors.errors[0].msg });
        else {
            const newEmployee = new Employee({
                defaultFreeSeats: Number(defaultFreeSeats),
                company: companyId,
                pin: pin
            });

            Employee.register(newEmployee, password, async (error, employee) => {
                if(employee) {
                    const username = "user" + employee.userNumber;

                    if(employee.username === "temp") {
                        employee.username = username;
                        await employee.save();
                    }

                    nodemailer.sendEmployeeSignUpCommunication(employee);

                    res.json({ message: "EMPLOYEE_SIGNUP_OK", username: username });
                } else
                    res.json({ message: error.name }); //UserExistsError USERNAME USED, MongoServerError E-MAIL USED, ValidationError WHEN IS NOT PROVIDED REQUIRED DATA
            });
        }
    } else
        res.json({ message: "EMPLOYEE_SIGNUP_ERROR" });
};

//CHECK ON findOne WITHOUT USING .then AND .catch FOR CODING CONVENIENCE
//IF I DON'T SEND THE JSON WITH THE EMPLOYEE INFO THE SERVER CAN'T RESPONDE WITH THE HEADER Set-Cookie SO THE CLIENT CAN'T BE LOGGED
exports.signin = async (req, res) => {
    const { username, password, notificationToken } = req.body;

    if(username && password) {
        passport.authenticate("local-employee", async (_, employee) => {
            if(employee) {
                if(employee.companyManagement === "accepted") {
                    const completeEmployee = await Employee.findById(employee._id).populate("company");

                    const signedToken = jsonWebToken.sign({
                        data: employee._id
                    }, process.env.AUTH_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });
        
                    await helpers.changeCurrentTokensEmployee(employee._id, signedToken, notificationToken);
                    
                    const dataJSON = {
                        message: "EMPLOYEE_SIGNIN_OK",
                        employee: helpers.clientFilterEmployee(completeEmployee), //SECURITY TECHNIQUE
                        token: signedToken
                    };

                    res.json(dataJSON);
                } else if(employee.companyManagement === "rejected")
                    res.json({ message: "EMPLOYEE_REJECTED" });
                else
                    res.json({ message: "EMPLOYEE_NOT_ACTIVATED" });
            } else
                res.json({ message: "EMPLOYEE_SIGNIN_NOT_FOUND" });
        })(req, res);
    } else
        res.json({ message: "EMPLOYEE_SIGNIN_ERROR" });
};

exports.logout = async (req, res) => {
    const token = req.headers.token;
    const employeeId = req.headers.employeeid;
    if(!employeeId || !token) return res.json({ message: "EMPLOYEE_ID_NOT_PROVIDED" });
    try {
        const { verifyToken } = require("../utils/tokenAuthentication");
        const payload = verifyToken(token);
        if(!payload || String(payload.data) !== String(employeeId))
            return res.json({ message: "EMPLOYEE_NOT_LOGGED" });
        const employee = await Employee.findById(employeeId);
        if(!employee || employee.currentValidToken !== token)
            return res.json({ message: "EMPLOYEE_NOT_LOGGED" });
        await helpers.invalidTokensEmployee(employeeId);
        return res.json({ message: "EMPLOYEE_LOGOUT_OK" });
    } catch (_) {
        return res.json({ message: "EMPLOYEE_NOT_LOGGED" });
    }
};

exports.getAllPendingEmployeesSignUp = (req, res) => {
    if(req.company) {
        Employee.find({
            company: req.company._id,
            companyManagement: "pending"
        })
        .then(pendingEmployees => res.json({ message: "GET_ALL_PENDING_EMPLOYEES_SIGNUP_OK", pendingEmployees: pendingEmployees.map(employee => ({
            _id: employee._id, username: employee.username, companyManagement: employee.companyManagement,
            defaultFreeSeats: employee.defaultFreeSeats, greenPoints: employee.greenPoints,
            pin: employee.pin
        })) }))
        .catch(() => res.json({ message: "GET_ALL_PENDING_EMPLOYEES_SIGNUP_ERROR" }));
    } else
        res.json({ message: "GET_ALL_PENDING_EMPLOYEES_SIGNUP_ERROR" });
};

exports.acceptEmployee = (req, res) => {
    const { employeeId } = req.body;

    if(employeeId && req.company) {
        Employee.findOneAndUpdate(
            { _id: employeeId, company: req.company._id },
            { "companyManagement": "accepted" }
        )
        .then(employee => employee
            ? res.json({ message: "ACCEPT_EMPLOYEE_OK", employee: {
                _id: employee._id, username: employee.username, pin: employee.pin,
                defaultFreeSeats: employee.defaultFreeSeats, greenPoints: employee.greenPoints,
                avgFeedback: employee.avgFeedback
            } })
            : res.json({ message: "ACCEPT_EMPLOYEE_ERROR" }))
        .catch(() => res.json({ message: "ACCEPT_EMPLOYEE_ERROR" }));
    } else
        res.json({ message: "ACCEPT_EMPLOYEE_ERROR" });
};

exports.rejectEmployee = (req, res) => {
    const { employeeId } = req.body;

    if(employeeId && req.company) {
        Employee.findOneAndUpdate(
            { _id: employeeId, company: req.company._id },
            {
                companyManagement: "rejected",
                currentValidToken: null
            }
        )
        .then(employee => res.json({ message: employee ? "REJECT_EMPLOYEE_OK" : "REJECT_EMPLOYEE_ERROR" }))
        .catch(() => res.json({ message: "REJECT_EMPLOYEE_ERROR" }));
    } else
        res.json({ message: "REJECT_EMPLOYEE_ERROR" });
};

exports.getAllCompanyEmployees = (req, res) => {
    if(req.company) {
        Employee.find({
            company: req.company._id,
            companyManagement: "accepted"
        })
        .then(employees => res.json({ message: "GET_ALL_COMPANY_EMPLOYEES_OK", employees: employees.map(employee => ({
            _id: employee._id, username: employee.username, companyManagement: employee.companyManagement,
            defaultFreeSeats: employee.defaultFreeSeats, greenPoints: employee.greenPoints,
            pin: employee.pin,
            avgFeedback: employee.avgFeedback
        })) }))
        .catch(() => res.json({ message: "GET_ALL_COMPANY_EMPLOYEES_ERROR" }));
    } else
        res.json({ message: "GET_ALL_COMPANY_EMPLOYEES_ERROR" });
};

exports.getGiftFile = (req, res) => {
    const filename = req.params.filename;

    if(filename) {
        const filenameURL = `${process.env.BASE_URL}/tokenApiEmployees/manageGifts/${filename}`;

        const notificationExists = req.employee.notifications.some(notification => notification.message === filenameURL);

        const { isSafeFilename } = require("../utils/authorization");
        if(notificationExists && isSafeFilename(filename, [".pdf"])) {
            const filepath = path.join(__dirname, "..", "greenride_cloud_storage", "gifts", filename);
            res.sendFile(filepath);
        } else
            res.sendStatus(500);
    } else
        res.sendStatus(500);
};