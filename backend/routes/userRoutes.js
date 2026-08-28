import express from "express";
import {
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);

router.get("/", protect, admin, getAllUsers);
router.put("/:id/toggle-status", protect, admin, toggleUserStatus);
router.delete("/:id", protect, admin, deleteUser);

export default router;
