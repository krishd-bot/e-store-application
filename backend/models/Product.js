import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: [true, "Description is required"] },
    brand: { type: String, trim: true, default: "Generic" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    images: [{ url: String, publicId: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });

productSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Number((total / this.reviews.length).toFixed(1));
  this.numReviews = this.reviews.length;
};

export default mongoose.model("Product", productSchema);
