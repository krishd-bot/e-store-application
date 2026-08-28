import asyncHandler from "express-async-handler";
import slugify from "../utils/slugify.js";
import Product from "../models/Product.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc  Get all products with filtering, search, sorting, pagination
// @route GET /api/products
// Query params: keyword, category, minPrice, maxPrice, brand, sizes, colors, rating, sort, page, limit
export const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    brand,
    sizes,
    colors,
    rating,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;
  if (brand) filter.brand = { $regex: brand, $options: "i" };
  if (sizes) filter.sizes = { $in: sizes.split(",") };
  if (colors) filter.colors = { $in: colors.split(",") };
  if (rating) filter.rating = { $gte: Number(rating) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
    popular: { soldCount: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc  Get single product by slug or id
// @route GET /api/products/:idOrSlug
export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(query)
    .populate("category", "name slug")
    .populate("reviews.user", "name");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, product });
});

// @desc  Get featured products (for homepage)
// @route GET /api/products/featured
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .limit(8);
  res.json({ success: true, products });
});

// @desc  Get related products (same category, excluding current)
// @route GET /api/products/:id/related
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(4);
  res.json({ success: true, products: related });
});

// @desc  Create product (admin)
// @route POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, brand, category, price, discountPrice, stock, sku, sizes, colors, tags, isFeatured } =
    req.body;

  if (!name || !description || !category || price === undefined || stock === undefined) {
    res.status(400);
    throw new Error("Please provide all required product fields");
  }

  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

  const product = await Product.create({
    name,
    slug: slugify(name) + "-" + Date.now().toString(36),
    description,
    brand,
    category,
    price,
    discountPrice: discountPrice || 0,
    stock,
    sku,
    sizes: sizes ? sizes.split(",").map((s) => s.trim()) : [],
    colors: colors ? colors.split(",").map((c) => c.trim()) : [],
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    isFeatured: isFeatured === "true" || isFeatured === true,
    images,
  });

  res.status(201).json({ success: true, product });
});

// @desc  Update product (admin)
// @route PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = ["name", "description", "brand", "category", "price", "discountPrice", "stock", "sku", "isFeatured", "isActive"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  if (req.body.sizes) product.sizes = req.body.sizes.split(",").map((s) => s.trim());
  if (req.body.colors) product.colors = req.body.colors.split(",").map((c) => c.trim());
  if (req.body.tags) product.tags = req.body.tags.split(",").map((t) => t.trim());
  if (req.body.name) product.slug = slugify(req.body.name) + "-" + product._id.toString().slice(-5);

  // New images appended; existing ones kept unless removeImages sent
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    product.images.push(...newImages);
  }
  if (req.body.removeImagePublicIds) {
    const toRemove = JSON.parse(req.body.removeImagePublicIds);
    for (const publicId of toRemove) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    product.images = product.images.filter((img) => !toRemove.includes(img.publicId));
  }

  const updated = await product.save();
  res.json({ success: true, product: updated });
});

// @desc  Delete product (admin)
// @route DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  for (const img of product.images) {
    if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

// @desc  Add a product review
// @route POST /api/products/:id/reviews
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.recalculateRating();
  await product.save();

  res.status(201).json({ success: true, message: "Review added" });
});

// @desc  Get distinct brands (for filter sidebar)
// @route GET /api/products/meta/brands
export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct("brand", { isActive: true });
  res.json({ success: true, brands: brands.filter(Boolean) });
});
