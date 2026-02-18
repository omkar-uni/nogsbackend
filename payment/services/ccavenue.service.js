const { encrypt } = require("../utils/crypto.util");

exports.createCCAvenueRequest = (amount) => {
  const merchant_id = process.env.MERCHANT_ID;
  const access_code = process.env.ACCESS_CODE;
  const working_key = process.env.WORKING_KEY;

  const order_id = "ORD_" + Date.now();

  const data = {
    merchant_id,
    order_id,
    currency: "INR",
    amount,
    redirect_url: process.env.REDIRECT_URL,
    cancel_url: process.env.CANCEL_URL,
    language: "EN",
  };

  const query = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)

    .join("&");
  console.log("CCAvenue Query:", query);

  const encRequest = encrypt(query, working_key);

  return {
    encRequest,
    access_code,
    order_id,
  };
};
