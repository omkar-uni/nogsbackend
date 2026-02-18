const express = require("express");
const router = express.Router();

const controller = require("../controllers/payment.controller");

router.post("/create", controller.createPayment);

module.exports = router;
