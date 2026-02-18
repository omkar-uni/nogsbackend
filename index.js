const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();

// Load Firebase Secrets
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

exports.sendMembershipEmail = onCall(
  { secrets: [GMAIL_USER, GMAIL_PASS] },
  async (request) => {
    try {
      const { email, status, name = "Member", membershipId = "" } =
        request.data || {};

      if (!email || !status) {
        throw new Error("Missing email or status");
      }

      // Nodemailer Transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: GMAIL_USER.value(),
          pass: GMAIL_PASS.value(),
        },
      });

      // Create Email Content
      let subject = "";
      let message = "";

   if (status === "approved") {
    subject = "Membership Approved";
    message = `Dear ${name},

We are pleased to inform you that your membership with NOGS has been approved.${
      membershipId ? " Your Membership ID is: " + membershipId + "." : ""
    }

You can log in to your membership portal using your email and password here:
https://nashikobgyn.com/login

Welcome to the NOGS community! We look forward to your active participation.`;
} else if (status === "rejected") {
    subject = "Membership Request Update";
    message = `Dear ${name},

We regret to inform you that your membership request with NOGS has not been approved at this time.

We appreciate your interest in joining our community and encourage you to apply again in the future.`;
}


      // Send Email
      await transporter.sendMail({
        from: GMAIL_USER.value(),
        to: email,
        subject,
        text: message,
      });

      return { success: true };
    } catch (error) {
      console.error("Email Error:", error);
      throw new Error("Email send failed");
    }
  }
);
