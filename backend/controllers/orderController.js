import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import { sendEmail } from "../config/nodemailer.js";
import { orderStatusEmail } from "../utils/emailTemplates.js";

// @desc  Get logged-in user's orders
// @route GET /api/orders/my
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc  Get single order (owner or admin only)
// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json({ success: true, order });
});

// @desc  Cancel an order (owner, only while Pending/Processing)
// @route PUT /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }
  if (!["Pending", "Processing"].includes(order.orderStatus)) {
    res.status(400);
    throw new Error("This order can no longer be cancelled");
  }
  order.orderStatus = "Cancelled";
  order.isCancelled = true;
  order.trackingHistory.push({ status: "Cancelled", note: "Cancelled by customer" });
  await order.save();
  res.json({ success: true, order });
});

// ---------- Admin ----------

// @desc  Get all orders (admin)
// @route GET /api/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 15 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

// @desc  Update order/delivery status (admin) - drives the delivery tracking system
// @route PUT /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;
  order.trackingHistory.push({ status, note });
  if (status === "Delivered") order.deliveredAt = Date.now();
  await order.save();

  await sendEmail({
    to: order.user.email,
    subject: `Order Update - #${order._id}`,
    html: orderStatusEmail(order),
  });

  res.json({ success: true, order });
});

// @desc  Sales dashboard summary (admin)
// @route GET /api/orders/stats/summary
export const getSalesSummary = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenueAgg = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const statusBreakdown = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);
  const recentOrders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5);

  res.json({
    success: true,
    totalOrders,
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    statusBreakdown,
    recentOrders,
  });
});
