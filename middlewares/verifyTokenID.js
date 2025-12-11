const admin = require("firebase-admin");

const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_KEY,
  "base64"
).toString("utf8");

const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyTokenID = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded) {
      return res.status(401).send({
        message: "Unauthorized access",
      });
    }

    req.decoded_email = decoded.email;
    next();
  } catch {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }
};

module.exports = { verifyTokenID };
