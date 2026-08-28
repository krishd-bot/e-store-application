import asyncHandler from "express-async-handler";
import slugify from "../utils/slugify.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { cloudinary } from "../config/cloudinary.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }
  const image = req.file ? { url: req.file.path, publicId: req.file.filename } : undefined;
  const category = await Category.create({ name, slug: slugify(name), image });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  if (req.body.name) {
    category.name = req.body.name;
    category.slug = slugify(req.body.name);
  }
  if (req.file) {
    if (category.image?.publicId) await cloudinary.uploader.destroy(category.image.publicId).catch(() => {});
    category.image = { url: req.file.path, publicId: req.file.filename };
  }
  await category.save();
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) {
    res.status(400);
    throw new Error("Cannot delete a category that has products assigned to it");
  }
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  if (category.image?.publicId) await cloudinary.uploader.destroy(category.image.publicId).catch(() => {});
  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
});
