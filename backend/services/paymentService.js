import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 🔹 Create order
export async function createOrder(amount, currency = "INR") {
  return await razorpay.orders.create({
    amount: amount * 100, // paise me
    currency,
    payment_capture: 1,
  });
}

// 🔹 Verify signature
export function verifyPaymentSignature(orderId, paymentId, signature) {
  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  hmac.update(orderId + "|" + paymentId);
  return hmac.digest("hex") === signature;
}
