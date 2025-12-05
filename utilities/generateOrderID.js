const generateOrderID = () => {
  const timestamp = Date.now().toString();
  const currentYear = new Date().getFullYear();

  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, "0");

  const orderID = `BW-${currentYear}-${timestamp.slice(-8)}-${random}`;

  return orderID;
};

module.exports = { generateOrderID };
