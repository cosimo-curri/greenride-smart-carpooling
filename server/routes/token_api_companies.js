const express = require("express");
const router = express.Router();
const auth = require("../utils/tokenAuthentication");

router.use(auth.companies);
router.use("/manageCompanies", require("./token_api_companies_routes/manageCompanies"));
router.use("/manageEmployees", auth.companyOnly, require("./token_api_companies_routes/manageEmployees"));
router.use("/manageSelfcertifications", auth.companyOnly, require("./token_api_companies_routes/manageSelfcertifications"));
router.use("/file", auth.companyOnly, require("./common/file"));

module.exports = router;
