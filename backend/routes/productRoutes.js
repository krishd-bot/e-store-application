import express from "express";
import {
  getProducts,
  getProductByIdOrSlug,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getBrands,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/meta/brands", getBrands);
router.get("/:id/related", getRelatedProducts);
router.get("/:idOrSlug", getProductByIdOrSlug);

router.post("/", protect, admin, upload.array("images", 6), createProduct);
router.put("/:id", protect, admin, upload.array("images", 6), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/reviews", protect, addProductReview);

export default router;
