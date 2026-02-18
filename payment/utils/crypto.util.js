const crypto = require("crypto");

exports.encrypt = (plainText, workingKey) => {
  const md5 = crypto.createHash("md5");
  md5.update(workingKey);

  const key = md5.digest();

  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};
