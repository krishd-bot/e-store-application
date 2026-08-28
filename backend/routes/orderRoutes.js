import express from "express";
import {
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getSalesSummary,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/my", protect, getMyOrders);
router.get("/stats/summary", protect, admin, getSalesSummary);
router.get("/", protect, admin, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
