const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { encrypt, decrypt } = require("./ccavutil");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();

// ============================
// GLOBAL DEBUG LOGGER
// ============================

const log = (step, data = "") => {
  console.log("\n==============================");
  console.log(`🔵 ${step}`);
  console.log("------------------------------");
  console.log(data);
  console.log("==============================\n");
};

// ============================
// MIDDLEWARE
// ============================

app.use(
  cors({
    origin: ["http://localhost:5173", "https://nashikobgyn.com"],
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================
// CREATE PAYMENT SESSION
// ============================

app.post("/api/create-payment", (req, res) => {
  try {
    log("API HIT", req.body);

    const { name, email, amount } = req.body;

    // ENV DEBUG
    log("ENV CHECK", {
      merchant_id: process.env.MERCHANT_ID,
      access_code_length: process.env.ACCESS_CODE?.length,
      working_key_length: process.env.WORKING_KEY?.length,
      redirect_url: process.env.REDIRECT_URL,
    });

    const orderId = "ORD_" + Date.now();

    log("ORDER CREATED", orderId);

    const paymentData =
      `merchant_id=${process.env.MERCHANT_ID}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${amount}` +
      `&redirect_url=${process.env.REDIRECT_URL}` +
      `&cancel_url=${process.env.CANCEL_URL}` +
      `&billing_name=${name}` +
      `&billing_email=${email}`;

    log("RAW PAYMENT DATA", paymentData);

    const encryptedData = encrypt(paymentData, process.env.WORKING_KEY);

    log("ENCRYPTED DATA (first 100 chars)", encryptedData.substring(0, 100));

    res.json({
      access_code: process.env.ACCESS_CODE,
      encRequest: encryptedData,
      orderId,
    });

    log("RESPONSE SENT TO FRONTEND");
  } catch (err) {
    console.error("❌ CREATE PAYMENT ERROR:", err);

    res.status(500).json({
      error: "Payment creation failed",
    });
  }
});

// ============================
// PAYMENT RESPONSE HANDLER
// ============================

app.post("/api/payment-success", (req, res) => {
  try {
    log("CCAvenue CALLBACK RECEIVED");

    const decrypted = decrypt(req.body.encResp, process.env.WORKING_KEY);

    log("DECRYPTED RESPONSE", decrypted);

    const params = new URLSearchParams(decrypted);

    const orderStatus = params.get("order_status");
    const email = params.get("billing_email");

    log("PAYMENT STATUS", orderStatus);

    if (orderStatus === "Success") {
      sendConfirmationEmail(email);
    }

    res.redirect(`/payment-result?status=${orderStatus}`);
  } catch (err) {
    console.error("❌ RESPONSE PROCESSING ERROR:", err);

    res.status(500).send("Callback error");
  }
});

// ============================
// EMAIL SENDER (WITH DEBUG)
// ============================

function sendConfirmationEmail(to) {
  log("SENDING EMAIL TO", to);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "YOUR_EMAIL",
      pass: "APP_PASSWORD",
    },
  });

  transporter.sendMail(
    {
      from: "Clinic",
      to,
      subject: "Payment Successful",
      text: "Your payment has been received successfully.",
    },
    (err, info) => {
      if (err) {
        console.error("❌ EMAIL ERROR:", err);
      } else {
        log("EMAIL SENT SUCCESSFULLY", info.response);
      }
    },
  );
}
log("KEY VALIDATION", {
  access_code_length: process.env.ACCESS_CODE.length,
  working_key_length: process.env.WORKING_KEY.length,
  access_code_starts_with: process.env.ACCESS_CODE.substring(0, 3),
  working_key_starts_with: process.env.WORKING_KEY.substring(0, 3),
});

// ============================
// SERVER START
// ============================

app.listen(5000, () => {
  log("SERVER STARTED", "Running on port 5000");
});
