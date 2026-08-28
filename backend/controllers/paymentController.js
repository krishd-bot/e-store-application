import asyncHandler from "express-async-handler";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendEmail } from "../config/nodemailer.js";
import { orderConfirmationEmail } from "../utils/emailTemplates.js";

// @desc  Create a Razorpay order for a given amount (called before checkout redirect)
// @route POST /api/payment/create-order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // amount in rupees
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Invalid amount");
  }

  const options = {
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);
  res.json({
    success: true,
    order: razorpayOrder,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc  Verify Razorpay payment signature and create the Order record
// @route POST /api/payment/verify
export const verifyAndPlaceOrder = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  // Verify signature to make sure the payment was not tampered with
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed. Signature mismatch.");
  }

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  // Verify stock and decrement atomically
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: "razorpay",
    paymentResult: {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "paid",
    },
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: true,
    paidAt: Date.now(),
    orderStatus: "Processing",
    trackingHistory: [{ status: "Processing", note: "Payment confirmed, order is being prepared" }],
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  const populatedOrder = await order.populate("user", "email name");
  await sendEmail({
    to: populatedOrder.user.email,
    subject: `Order Confirmed - #${order._id}`,
    html: orderConfirmationEmail(order),
  });

  res.status(201).json({ success: true, order });
});

// @desc  Place a Cash on Delivery order (no payment gateway)
// @route POST /api/payment/cod
export const placeCodOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: "cod",
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: false,
    orderStatus: "Processing",
    trackingHistory: [{ status: "Processing", note: "Order placed with Cash on Delivery" }],
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  const populatedOrder = await order.populate("user", "email name");
  await sendEmail({
    to: populatedOrder.user.email,
    subject: `Order Placed - #${order._id}`,
    html: orderConfirmationEmail(order),
  });

  res.status(201).json({ success: true, order });
});
