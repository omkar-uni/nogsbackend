const ccavenueService = require("../services/ccavenue.service");
const db = require("../../../../client/src/firebaseConfig");

exports.createPayment = async (req, res) => {
  const { amount } = req.body;

  const payment = ccavenueService.createCCAvenueRequest(amount);

  await db.collection("orders").doc(payment.order_id).set({
    amount,
    status: "PENDING",
  });

  res.json({
    encRequest: payment.encRequest,
    access_code: payment.access_code,
    url: "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  });
};
