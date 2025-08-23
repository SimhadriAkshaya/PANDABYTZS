import express from "express";
const router = express.Router();

// Example: GET /orders
router.get("/", (req, res) => {
  res.json([
    { orderId: 1, type: "white cone", utr: "UTR12345" },
    { orderId: 2, type: "dark cone", utr: "UTR67890" }
  ]);
});

// Example: POST /orders
router.post("/", (req, res) => {
  const { orderType, utrNumber } = req.body;
  res.json({ message: "Order placed successfully", orderType, utrNumber });
});

export default router;
