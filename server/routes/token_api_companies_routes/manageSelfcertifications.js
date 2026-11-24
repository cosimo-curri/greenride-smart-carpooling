const express = require("express");
const router = express.Router();

const selfcertificationsController = require("../../controllers/selfcertifications");

router.get("/getAllPendingSelfcertification", selfcertificationsController.getAllPendingSelfcertification);
router.get("/:filename", selfcertificationsController.getSelfcertificationFile);
router.post("/acceptSelfcertification", selfcertificationsController.acceptSelfcertification);
router.post("/rejectSelfcertification", selfcertificationsController.rejectSelfcertification);

module.exports = router;