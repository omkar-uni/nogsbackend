const crypto = require("crypto");

exports.encrypt = function (plainText, workingKey) {
  const m = crypto.createHash("md5");
  m.update(workingKey);
  const key = m.digest();

  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

exports.decrypt = function (encryptedText, workingKey) {
  const m = crypto.createHash("md5");
  m.update(workingKey);
  const key = m.digest();

  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
