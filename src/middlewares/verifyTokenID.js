const admin = require("firebase-admin");
const { envConfig } = require("../config/env");

const serviceKey = envConfig.FIREBASE_SERVICE_KEY;

if (!serviceKey) {
  throw new Error(
    "FIREBASE_SERVICE_KEY is not defined in environment variables",
  );
}

const decoded = Buffer.from(serviceKey, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyTokenID = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.substring(7);

    if (!token) throw new Error("Unauthorized access");

    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded) throw new Error("Unauthorized access");

    req.decoded_email = decoded.email;
    next();
  } catch {
    res.status(401).send({ success: false, message: "Unauthorized access" });
  }
};

module.exports = { verifyTokenID };
