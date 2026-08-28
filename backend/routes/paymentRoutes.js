import express from "express";
import { createRazorpayOrder, verifyAndPlaceOrder, placeCodOrder } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyAndPlaceOrder);
router.post("/cod", protect, placeCodOrder);

export default router;
