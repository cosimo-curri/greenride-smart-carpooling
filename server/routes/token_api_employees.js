const express = require("express");
const router = express.Router();

const Employee = require("../models/employees");
const Offer = require("../models/offers");
const GreenInfo = require("../models/greenInfo");
const helpers = require("../utils/helpers");
const { sameId, belongsToCompany } = require("../utils/authorization");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const TEMP_DIR = path.join(__dirname, "../greenride_cloud_storage/tempAudios");
fs.mkdirSync(TEMP_DIR, { recursive: true });
if(process.env.FFMPEG_PATH) ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

const manageGiftsRouter = require("./token_api_employees_routes/manageGifts");
const manageLLM = require("./token_api_employees_routes/manageLLM");
const manageOffersRouter = require("./token_api_employees_routes/manageOffers");

router.use(require("../utils/tokenAuthentication").employees);
router.use("/file", require("./common/file"));

router.post("/transcribeAudio", async (req, res) => {
    const { audioBase64 } = req.body;
    if(typeof audioBase64 !== "string" || !audioBase64.length || audioBase64.length > 14_000_000)
        return res.json({ message: "TRANSCRIBE_AUDIO_ERROR" });

    const id = uuidv4();
    const inputPath = path.join(TEMP_DIR, `${id}.m4a`);
    const outputPath = path.join(TEMP_DIR, `${id}.wav`);
    const cleanup = async () => {
        await Promise.allSettled([fs.promises.unlink(inputPath), fs.promises.unlink(outputPath)]);
    };
    try {
        const base64Data = audioBase64.replace(/^data:audio\/[\w.+-]+;base64,/, "");
        if(!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) throw new Error("Invalid base64 audio");
        await fs.promises.writeFile(inputPath, Buffer.from(base64Data, "base64"));
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath).outputOptions(["-ar 16000", "-ac 1"])
                .toFormat("wav").on("end", resolve).on("error", reject).save(outputPath);
        });
        const audioWavBase64 = (await fs.promises.readFile(outputPath)).toString("base64");
        const response = await fetch(process.env.API_TRANSCRIBE_VOSK_DOCKER_SERVER, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: audioWavBase64 })
        });
        if(!response.ok) throw new Error("Vosk transcription request failed");
        const result = await response.json();
        if(typeof result.text !== "string") throw new Error("Invalid Vosk response");
        return res.json({ message: "TRANSCRIBE_AUDIO_OK", text: result.text });
    } catch (_) {
        return res.json({ message: "TRANSCRIBE_AUDIO_ERROR" });
    } finally {
        await cleanup();
    }
});

router.get("/getChangableValuesByEmployeeId", async (req, res) => {
    if(sameId(req.headers.employeeid, req.employee._id)) {
        Employee.findById(req.employee._id)
        .then(async (employee) => {
            const reversedNotifications = [...employee.notifications].reverse();

            const now = new Date();

            const offers = await Offer.find({})
            .populate({
                path: "employee",
                match: { company: req.employee.company },
                select: "username"
            })
            .lean();

            const filteredOffers = offers.filter(offer => {
                if(!offer.employee) return false;

                const requestFromEmployee = offer.pendingRequests.find(reqObj =>
                    reqObj.employeeRequestId?.toString() === req.employee._id.toString()
                );

                if(requestFromEmployee && requestFromEmployee.status === "accepted" && requestFromEmployee.feedback === false)
                    return true;

                const isOwnOffer = offer.employee._id.toString() === req.employee._id.toString();

                const [day, month, year] = offer.departureDate.split("/").map(Number);
                const [hours, minutes] = offer.departureTime.split(":").map(Number);
                const departureDateTime = new Date(year, month - 1, day, hours, minutes);

                if(isOwnOffer) {
                    if(offer.closed === false)
                        return true;
                    else
                        return departureDateTime > now;
                } else {
                    if(offer.freeSeats <= 0) return false;
                    return departureDateTime > now;
                }
            });

            const greenInfo = await GreenInfo.findOne();

            res.json({ message: "GET_CHANGABLE_VALUES_BY_EMPLOYEE_ID_OK", greenPoints: employee.greenPoints, notifications: reversedNotifications, offers: filteredOffers, greenInfo: greenInfo })
        })
        .catch((_) => res.json({ message: "GET_CHANGABLE_VALUES_BY_EMPLOYEE_ID_ERROR" }));
    } else
        res.json({ message: "GET_CHANGABLE_VALUES_BY_EMPLOYEE_ID_ERROR" });
});

router.post("/sendFeedback", async (req, res) => {
    const { offerId, rating } = req.body;
    if(!offerId || !Number.isInteger(rating) || rating < 1 || rating > 5)
        return res.json({ message: "SEND_FEEDBACK_ERROR" });
    try {
        const offer = await Offer.findById(offerId).populate("employee");
        if(!offer || !offer.employee || !belongsToCompany(offer.employee, req.employee.company))
            return res.json({ message: "SEND_FEEDBACK_ERROR" });
        // An atomic claim prevents repeat feedback from increasing the driver's score twice.
        const result = await Offer.updateOne({
            _id: offerId,
            pendingRequests: { $elemMatch: {
                employeeRequestId: req.employee._id, status: "accepted", feedback: false
            } }
        }, { $set: { "pendingRequests.$.feedback": true } });
        if(result.modifiedCount !== 1) return res.json({ message: "SEND_FEEDBACK_ERROR" });
        await Employee.updateOne({ _id: offer.employee._id }, {
            $inc: { "avgFeedback.feedbackSum": rating, "avgFeedback.feedbackCount": 1 }
        });
        return res.json({ message: "SEND_FEEDBACK_OK" });
    } catch (_) {
        return res.json({ message: "SEND_FEEDBACK_ERROR" });
    }
});

router.get("/getRanking", async (req, res) => {
    try {
        const ranking = await Employee.find(
            { company: req.employee.company },
            {
                username: 1,
                avgFeedback: 1,
                greenPoints: 1
            }
        ).sort({ greenPoints: -1 });

        res.json({ message: "GET_RANKING_OK", ranking: ranking });
    } catch(_) {
        res.json({ message: "GET_RANKING_ERROR" });
    }
});

router.post("/notifyEmployeeStop", async (req, res) => {
    const { userId } = req.body;

    if(userId) {
        try {
            const employeeNotification = await Employee.findById(userId);

            if(!employeeNotification || !belongsToCompany(employeeNotification, req.employee.company))
                return res.json({ message: "NOTIFY_EMPLOYEE_STOP_ERROR" });

            const titleNotification = "Hey! Your Stop's Here!";
            const messageNotification = "Hey there, carpool champ! Time to hop off: your stop's arrived. Catch you next ride!";

            employeeNotification.notifications.push({
                title: titleNotification,
                message: messageNotification
            });

            await employeeNotification.save();

            helpers.sendEmployeeAppNotification(employeeNotification.notificationToken, titleNotification, messageNotification);

            res.json({ message: "NOTIFY_EMPLOYEE_STOP_OK" });
        } catch(_) {
            res.json({ message: "NOTIFY_EMPLOYEE_STOP_ERROR" });
        }
    } else
        res.json({ message: "NOTIFY_EMPLOYEE_STOP_ERROR" });
});

router.use("/manageGifts", manageGiftsRouter);
router.use("/manageLLM", manageLLM);
router.use("/manageOffers", manageOffersRouter);

module.exports = router;