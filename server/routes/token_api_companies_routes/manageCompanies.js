const express = require("express");
const router = express.Router();

const companiesController = require("../../controllers/companies");

//////////////////////////////////////////
/// ONLY FOR COMPANY GreenRide (ADMIN) ///
//////////////////////////////////////////

router.get("/getAllPendingSignUpRequests", companiesController.getAllPendingSignUpRequests);
router.post("/acceptCompany", companiesController.acceptCompany);
router.delete("/rejectCompany", companiesController.rejectCompany);

///////////////////////////////////
/// FOR ALL THE OTHER COMPANIES ///
///////////////////////////////////

//...

module.exports = router;