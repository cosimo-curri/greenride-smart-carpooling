const nodemailer = require("nodemailer");

const Company = require("../models/companies");
const Employee = require("../models/employees");

const gmailTransporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

const CSS = `
    html {
        height: 100%;
        width: 100%;
    }

    body {
        margin: 0px;
        padding: 20px;
    }

    p {
        margin: 0px;
    }

    strong {
        color: #4E802E;
    }
`;

//E-MAIL CLIENTS IGNORE EXTERNAL CSS FILE
const generateHTML = (body) => {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>GreenRide</title>

                <style type="text/css">
                    ${CSS}
                </style>
            </head>

            <body>
                ${body}
            </body>
        </html>
    `;
};

const send = (res, emailValues) => {
    gmailTransporter.sendMail(
        emailValues,
        (error) => {
            if(error)
                res.json({ message: "EMAIL_SEND_ERROR" });
            else
                res.json({ message: "EMAIL_SEND_OK" });
        }
    );
};

///////////////////
/// MIDDLEWARES ///
///////////////////

//INSTEAD OF SIGNUP THE COMPANY AFTER THE CLICK IN THE E-MAIL THE SERVER DOES THE OPPOSITE SO IT DOESN'T HAVE TO SPECIFY PERSONAL INFORMATIONS
exports.signupCompanyConfirmEmail = (req, res) => {
    const { name, VAT, email, headquartersCoordinates, activationToken } = req.body;

    if(name && VAT && email && headquartersCoordinates && activationToken) {
        const emailValues = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: "Complete your Sign-Up on GreenRide",
            html: generateHTML(`
                <p>
                    Dear <strong>${name}</strong>,
                    <br>
                    Thank you for registering on GreenRide.
                    
                    <br><br>

                    We have successfully received your information:
                </p>

                <ul>
                    <li>🧾 ${VAT}</li>
                    <li>📍 ${headquartersCoordinates.coordinates[1]}, ${headquartersCoordinates.coordinates[0]}</li>
                </ul>

                <p>
                    Your registration is almost complete. Please <a href="${process.env.BASE_URL}/apiCompanies/active/${activationToken}" style="color: #4E802E;">click here</a> to confirm your e-mail address.
                    <br>
                    <strong>Then, we will shortly review your application for registration on behalf of the company you represent, and you will find out whether it has been approved or denied via e-mail</strong>.
                </p>
            `)
        };

        send(res, emailValues);
    } else
        res.json({ message: "EMAIL_SEND_ERROR" });
};

exports.changePasswordRequest = (req, res) => {
    const { email, changePasswordToken } = req.body;

    if(email && changePasswordToken) {
        const emailValues = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: "GreenRide Restore Password",
            html: generateHTML(`
                <p>
                    We have received a request to change your password. If it wasn't you contact us, otherwise <a href="${process.env.BASE_URL}/apiCompanies/managePassword/restorePassword/${changePasswordToken}" style="color: #4E802E;">click here</a> to complete the procedure.
                </p>
            `)
        };

        send(res, emailValues);
    } else
        res.json({ message: "RESTORE_PASSWORD_COMPANY_ERROR" });
};

//////////////////////
/// NO MIDDLEWARES ///
//////////////////////

exports.sendEmployeeSignUpCommunication = async (employee) => {
    if(employee) {
        const username = employee.username;
        const defaultFreeSeats = employee.defaultFreeSeats;
        const company = employee.company;
        const pin = employee.pin;
        
        const companyEmail = await Company.findById(company).select("email");

        const emailValues = {
            from: process.env.GMAIL_EMAIL,
            to: companyEmail,
            subject: "New GreenRide Registration at your Company",
            html: generateHTML(`
                <p>
                    We have received a new registration request at your company from a user with the following information:
                </p>

                <ul>
                    <li><strong style="color: black;">Username</strong>: ${username}</li>
                    <li><strong style="color: black;">Number of default free seats</strong>: ${defaultFreeSeats}</li>
                    <li><strong style="color: black;">Default coordinates</strong>: ${pin.coordinates[1]}, ${pin.coordinates[0]}</li>
                </ul>

                <p>
                    The user's account is currently disabled. Please log in to the control panel to manage their registration request.
                </p>
            `)
        };

        gmailTransporter.sendMail(emailValues);
    }
}

exports.sendEmployeeNewSelfcertificationCommunication = async (employeeid) => {
    if(employeeid) {
        const employee = await Employee.findById(employeeid).populate("company");

        const username = employee.username;
        const companyEmail = employee.company.email;

        const emailValues = {
            from: process.env.GMAIL_EMAIL,
            to: companyEmail,
            subject: "New GreenRide Self-Certification at your Company",
            html: generateHTML(`
                <p>
                    The user ${username} has submitted a self-certification at your company. Check your control panel!
                </p>
            `)
        };

        gmailTransporter.sendMail(emailValues);
    }
}