const express = require("express");
const router = express.Router();

const { v4: uuidv4 } = require("uuid");
const expressFileUpload = require("express-fileupload");

const helpers = require("../../utils/helpers");
const nodemailer = require("../../utils/nodemailer");
const path = require("path");
const fs = require("node:fs/promises");

const Employee = require("../../models/employees");
const Selfcertification = require("../../models/selfcertifications");

router.use(expressFileUpload({ limits: { fileSize: 50 * 1024 * 1024 }, abortOnLimit: true, useTempFiles: false }));

//////////////////////////////////////////////////////////////////////////////////////////////////
/// ROUTE ONLY FOR UPLOADING FILE IN THE WEB SERVER AND FOR MANAGING THE EFFECTS ON THE SYSTEM ///
//////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/uploadLogo", async (req, res) => {
    // A logo can be uploaded during signup, before an account is active.
    const file = req.files?.filesArray;
    if(!file || Array.isArray(file)) return res.json({ message: "MORE_FILE_ERROR" });
    if(path.extname(file.name).toLowerCase() !== ".svg")
        return res.json({ message: "EXT_NOT_SUPPORTED" });
    if(file.mimetype !== "image/svg+xml")
        return res.json({ message: "MIME_TYPE_NOT_SUPPORTED" });
    if(file.size > 2 * 1024 * 1024)
        return res.json({ message: "UPLOAD_ERROR" });
    // Reject active content; served SVGs also have a restrictive CSP.
    const svg = file.data.toString("utf8");
    if(/<script\b|<foreignObject\b|\bon[a-z]+\s*=|javascript:|<!DOCTYPE|<!ENTITY/iu.test(svg))
        return res.json({ message: "UPLOAD_ERROR" });
    const filename = uuidv4() + ".svg";
    const result = await helpers.fileUpload(
        path.join(__dirname, "../../greenride_cloud_storage/logos", filename), file
    );
    return res.json({ message: result.message, filename });
});

router.post(
    "/uploadSelfcertifications",
    (req, res, next) => {
        if(req.employee && String(req.headers.employeeid) === String(req.employee._id)) {
            if(!req.files || !req.files.files)
                return res.json({ message: "NO_FILES_UPLOADED" });
            
            if(!Array.isArray(req.files.files))
                req.files.files = [req.files.files];
            
            next();
        } else
            res.json({ message: "UPLOAD_SELFCERTIFICATIONS_ERROR" });
    },
    async (req, res) => {
        const allowedExt = [
            ".heic", ".heif", ".jpg", ".jpeg", ".png",
            ".mov", ".mp4", ".m4v",
            ".pdf"
        ];

        const allowedMimeTypes = [
            "image/heic", "image/heif", "image/jpeg", "image/png",
            "video/quicktime", "video/mp4", "video/x-m4v",
            "application/pdf"
        ];

        const files = req.files.files;
        // Validate the entire batch before writing anything to disk.
        for(const file of files) {
            if(!allowedExt.includes(path.extname(file.name).toLowerCase()))
                return res.json({ message: "EXT_NOT_SUPPORTED" });
            if(!allowedMimeTypes.includes(file.mimetype))
                return res.json({ message: "MIME_TYPE_NOT_SUPPORTED" });
        }

        const uploadedURLs = [];
        const uploadedPaths = [];
        try {
            for(const file of files) {
                const filename = uuidv4() + path.extname(file.name).toLowerCase();
                const filepath = path.join(__dirname, "..", "..", "greenride_cloud_storage", "selfcertifications", filename);
                // Track the destination before writing, so partial failed writes are removed.
                uploadedPaths.push(filepath);
                const result = await helpers.fileUpload(filepath, file);
                if(result.message !== "UPLOAD_OK")
                    throw new Error("Self-certification upload failed");
                uploadedURLs.push(`${process.env.BASE_URL}/tokenApiCompanies/manageSelfcertifications/${filename}`);
            }

            const newSelfcertification = new Selfcertification({
                documentsURLs: uploadedURLs,
                employee: req.employee._id
            });
            await newSelfcertification.save();
        } catch (_) {
            // Do not leave orphaned files if a later upload or DB write fails.
            await Promise.allSettled(uploadedPaths.map(file => fs.unlink(file)));
            return res.json({ message: "UPLOAD_SELFCERTIFICATIONS_ERROR" });
        }

        nodemailer.sendEmployeeNewSelfcertificationCommunication(req.employee._id);
        res.json({ message: "UPLOAD_SELFCERTIFICATIONS_OK" });
    }
);

router.post(
    "/uploadGifts",
    (req, res, next) => {
        if(
            req.files &&
            Array.isArray(req.files.filesArray) &&
            req.files.filesArray.length === 3 &&
            req.company &&
            req.headers.first_place_employee_id &&
            req.headers.second_place_employee_id &&
            req.headers.third_place_employee_id
        )
            next();
        else
            res.json({ message: "UPLOAD_ERROR" });
    },
    async (req, res) => {
        const firstPlaceEmployeeId = req.headers.first_place_employee_id;
        const secondPlaceEmployeeId = req.headers.second_place_employee_id;
        const thirdPlaceEmployeeId = req.headers.third_place_employee_id;

        const allowedExt = [".pdf"];
        const allowedMimeTypes = ["application/pdf"];

        const files = req.files.filesArray;

        const employeeIds = [firstPlaceEmployeeId, secondPlaceEmployeeId, thirdPlaceEmployeeId];
        if(new Set(employeeIds).size !== 3) return res.json({ message: "UPLOAD_ERROR" });
        const eligible = await Employee.countDocuments({
            _id: { $in: employeeIds }, company: req.company._id, companyManagement: "accepted"
        });
        if(eligible !== 3) return res.json({ message: "UPLOAD_ERROR" });

        const uploadedFilenames = [];

        for(const file of files) {
            const ext = path.extname(file.name);
            const mimeType = file.mimetype;

            if(!allowedExt.includes(ext))
                return res.json({ message: "EXT_NOT_SUPPORTED" });

            if(!allowedMimeTypes.includes(mimeType))
                return res.json({ message: "MIME_TYPE_NOT_SUPPORTED" });

            const filename = uuidv4() + ".pdf";
            uploadedFilenames.push(filename);

            const resUpload = await helpers.fileUpload(
                path.join(__dirname, "..", "..", "greenride_cloud_storage", "gifts", filename),
                file
            );

            if(resUpload.message === "UPLOAD_ERROR")
                return res.json({ message: "UPLOAD_ERROR" });
        }

        const firstPlaceEmployee = await Employee.findById(firstPlaceEmployeeId);
        const secondPlaceEmployee = await Employee.findById(secondPlaceEmployeeId);
        const thirdPlaceEmployee = await Employee.findById(thirdPlaceEmployeeId);

        const firstPlaceTitle = "Woohoo! You snagged the 1st place!";
        const secondPlaceTitle = "Woohoo! You snagged the 2nd place!";
        const thirdPlaceTitle = "Woohoo! You snagged the 3rd place!";

        const firstPlaceMessage = `${process.env.BASE_URL}/tokenApiEmployees/manageGifts/${uploadedFilenames[0]}`;
        const secondPlaceMessage = `${process.env.BASE_URL}/tokenApiEmployees/manageGifts/${uploadedFilenames[1]}`;
        const thirdPlaceMessage = `${process.env.BASE_URL}/tokenApiEmployees/manageGifts/${uploadedFilenames[2]}`;

        firstPlaceEmployee.notifications.push({
            title: firstPlaceTitle,
            message: firstPlaceMessage
        });

        secondPlaceEmployee.notifications.push({
            title: secondPlaceTitle,
            message: secondPlaceMessage
        });

        thirdPlaceEmployee.notifications.push({
            title: thirdPlaceTitle,
            message: thirdPlaceMessage
        });

        await firstPlaceEmployee.save();
        await secondPlaceEmployee.save();
        await thirdPlaceEmployee.save();

        helpers.sendEmployeeAppNotification(firstPlaceEmployee.notificationToken, firstPlaceTitle, firstPlaceMessage);
        helpers.sendEmployeeAppNotification(secondPlaceEmployee.notificationToken, secondPlaceTitle, secondPlaceMessage);
        helpers.sendEmployeeAppNotification(thirdPlaceEmployee.notificationToken, thirdPlaceTitle, thirdPlaceMessage);

        await Employee.updateMany({ company: req.company._id }, { $set: { greenPoints: 0 } });

        res.json({ message: "UPLOAD_OK" });
    }
);

module.exports = router;