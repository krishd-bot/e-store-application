import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc  Update own profile (name, addresses)
// @route PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (req.body.name) user.name = req.body.name;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({
    success: true,
    user: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role },
  });
});

// @desc  Add address
// @route POST /api/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc  Delete address
// @route DELETE /api/users/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc  Toggle wishlist item
// @route POST /api/users/wishlist/:productId
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((id) => id.toString() === req.params.productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(req.params.productId);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

// @desc  Get wishlist
// @route GET /api/users/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ success: true, wishlist: user.wishlist });
});

// ---------- Admin ----------

// @desc  Get all users (admin)
// @route GET /api/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc  Toggle user active/deactivated (admin)
// @route PUT /api/users/:id/toggle-status
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot deactivate an admin account");
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
});

// @desc  Delete a user (admin)
// @route DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete an admin account");
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});
