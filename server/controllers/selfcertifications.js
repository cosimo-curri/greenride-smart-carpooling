const Selfcertification = require("../models/selfcertifications");
const Employee = require("../models/employees");

const helpers = require("../utils/helpers");
const path = require("path");
const { belongsToCompany, isSafeFilename } = require("../utils/authorization");

exports.getAllPendingSelfcertification = (req, res) => {
    const companyid = req.company?._id;

    if(companyid) {
        Selfcertification.find({ companyManagement: "pending" })
        .populate({
            path: "employee",
            match: { company: companyid },
            select: "_id company username"
        })
        .then(pendingSelfcertifications => {
            const filtered = pendingSelfcertifications.filter(item => item.employee);
            res.json({ message: "GET_ALL_PENDING_SELFCERTIFICATIONS_OK", pendingSelfcertification: filtered });
        })
        .catch(() => res.json({ message: "GET_ALL_PENDING_SELFCERTIFICATIONS_ERROR" }));
    } else
        res.json({ message: "GET_ALL_PENDING_SELFCERTIFICATIONS_ERROR" });
};

exports.getSelfcertificationFile = (req, res) => {
    const employeeid = req.headers.employeeid;
    const filename = req.params.filename;

    if(employeeid && filename) {
        const companyLoggedId = req.company._id;
        if(!isSafeFilename(filename, [".pdf", ".png", ".jpg", ".jpeg", ".heic", ".heif", ".mov", ".mp4", ".m4v"]))
            return res.sendStatus(404);

        Employee.findById(employeeid)
        .then(async employee => {
            const filenameURL = `${process.env.BASE_URL}/tokenApiCompanies/manageSelfcertifications/${filename}`;
            if(employee && belongsToCompany(employee, companyLoggedId)) {
                const exists = await Selfcertification.exists({ employee: employee._id, documentsURLs: filenameURL });
                if(!exists) return res.sendStatus(404);
                const filepath = path.join(__dirname, "..", "greenride_cloud_storage", "selfcertifications", filename);
                res.sendFile(filepath);
            } else
                res.sendStatus(500);
        })
        .catch(() => res.sendStatus(500));
    } else
        res.sendStatus(500);
};

exports.acceptSelfcertification = async (req, res) => {
    const { selfcertificationId } = req.body;

    const titleNotification = "Woohoo! Self-Certification Approved!";
    const messageNotification = `+${process.env.BONUS_SELFCERTIFICATION} GreenPoints`;

    if(selfcertificationId) {
        const eligibleEmployeeIds = await Employee.find({ company: req.company?._id }).distinct("_id");
        const selfcertification = await Selfcertification.findOneAndUpdate(
            { _id: selfcertificationId, companyManagement: "pending", employee: { $in: eligibleEmployeeIds } },
            { $set: { companyManagement: "accepted" } },
            { new: false }
        ).populate("employee");

        if(!selfcertification || !selfcertification.employee ||
            !belongsToCompany(selfcertification.employee, req.company?._id))
            return res.json({ message: "ACCEPT_SELFCERTIFICATION_ERROR" });


        const employee = selfcertification.employee;
        employee.greenPoints = employee.greenPoints + Number(process.env.BONUS_SELFCERTIFICATION);
        employee.notifications.push({
            title: titleNotification,
            message: messageNotification
        });
        await employee.save();

        helpers.sendEmployeeAppNotification(employee.notificationToken, titleNotification, messageNotification);

        res.json({ message: "ACCEPT_SELFCERTIFICATION_OK", updatedGreenPoints: employee.greenPoints });
    } else
        res.json({ message: "ACCEPT_SELFCERTIFICATION_ERROR" });
};

exports.rejectSelfcertification = async (req, res) => {
    const { selfcertificationId } = req.body;

    const titleNotification = "Oops! Self-Certification Not Approved!";
    const messageNotification = `${process.env.MALUS_SELFCERTIFICATION} GreenPoints`;

    if(selfcertificationId) {
        const eligibleEmployeeIds = await Employee.find({ company: req.company?._id }).distinct("_id");
        const selfcertification = await Selfcertification.findOneAndUpdate(
            { _id: selfcertificationId, companyManagement: "pending", employee: { $in: eligibleEmployeeIds } },
            { $set: { companyManagement: "rejected" } },
            { new: false }
        ).populate("employee");

        if(!selfcertification || !selfcertification.employee ||
            !belongsToCompany(selfcertification.employee, req.company?._id))
            return res.json({ message: "REJECT_SELFCERTIFICATION_ERROR" });


        const employee = selfcertification.employee;
        employee.greenPoints = employee.greenPoints + Number(process.env.MALUS_SELFCERTIFICATION);
        employee.notifications.push({
            title: titleNotification,
            message: messageNotification
        });
        await employee.save();

        helpers.sendEmployeeAppNotification(employee.notificationToken, titleNotification, messageNotification);

        res.json({ message: "REJECT_SELFCERTIFICATION_OK", updatedGreenPoints: employee.greenPoints });
    } else
        res.json({ message: "REJECT_SELFCERTIFICATION_ERROR" });
};