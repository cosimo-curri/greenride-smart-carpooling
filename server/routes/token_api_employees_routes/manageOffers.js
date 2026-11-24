const express = require("express");
const router = express.Router();

const offersController = require("../../controllers/offers");

router.post("/savePendingRequest", offersController.savePendingRequest);
router.post("/acceptPendingRequest", offersController.acceptPendingRequest);
router.post("/rejectPendingRequest", offersController.rejectPendingRequest);
router.post("/closeOffer", offersController.closeOffer);

module.exports = router;