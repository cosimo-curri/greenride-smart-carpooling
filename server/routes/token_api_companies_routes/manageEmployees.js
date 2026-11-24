const express = require("express");
const router = express.Router();

const employeesController = require("../../controllers/employees");

router.get("/getAllPendingEmployeesSignUp", employeesController.getAllPendingEmployeesSignUp);
router.post("/acceptEmployee", employeesController.acceptEmployee);
router.post("/rejectEmployee", employeesController.rejectEmployee);
router.get("/getAllCompanyEmployees", employeesController.getAllCompanyEmployees);

module.exports = router;