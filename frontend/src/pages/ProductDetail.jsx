import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaShoppingBag, FaCheckCircle } from "react-icons/fa";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Price from "../components/Price.jsx";
import StarRating from "../components/StarRating.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${idOrSlug}`);
      setProduct(data.product);
      setSize(data.product.sizes?.[0] || "");
      setColor(data.product.colors?.[0] || "");
      setActiveImage(0);
      const { data: relData } = await api.get(`/products/${data.product._id}/related`);
      setRelated(relData.products);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrSlug]);

  const handleAddToCart = () => {
    if (product.sizes?.length && !size) return toast.error("Please select a size");
    if (product.colors?.length && !color) return toast.error("Please select a color");
    addToCart(product, qty, size, color);
    toast.success("Added to cart");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please sign in to leave a review");
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success("Review submitted");
      setReviewForm({ rating: 5, comment: "" });
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader label="Loading product" />;
  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-ink/60 mb-4">Product not found.</p>
        <Link to="/products" className="btn-primary">Back to shop</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: "https://placehold.co/800x800/E7E3DB/14213D?text=Aurelia" }];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-mist mb-4">
            <img src={images[activeImage]?.url} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded overflow-hidden border-2 ${
                    activeImage === i ? "border-ink" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-wider text-ink/40 mb-2">{product.brand}</p>
          <h1 className="font-display text-3xl mb-3">{product.name}</h1>
          <div className="mb-4">
            <StarRating rating={product.rating} count={product.numReviews} />
          </div>
          <Price price={product.price} discountPrice={product.discountPrice} size="text-2xl" />

          <p className="text-ink/60 leading-relaxed mt-6 mb-6">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-10 h-10 text-xs rounded border ${
                      size === s ? "bg-ink text-paper border-ink" : "border-mist text-ink/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`text-xs px-3 py-2 rounded-full border ${
                      color === c ? "bg-ink text-paper border-ink" : "border-mist text-ink/60"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-3 w-fit border border-mist rounded-md">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-ink/60 hover:text-ink">
                <FaMinus size={11} />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="p-3 text-ink/60 hover:text-ink"
              >
                <FaPlus size={11} />
              </button>
            </div>
            <p className="text-xs text-ink/40 mt-2">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <FaShoppingBag size={14} /> Add to cart
          </button>

          <div className="mt-8 flex items-center gap-2 text-sm text-sage">
            <FaCheckCircle size={14} /> Free delivery on orders above ₹999
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-20 max-w-3xl">
        <h2 className="font-display text-2xl mb-6">Customer reviews ({product.numReviews})</h2>

        <div className="space-y-6 mb-10">
          {product.reviews?.length === 0 && <p className="text-ink/50 text-sm">No reviews yet. Be the first!</p>}
          {product.reviews?.map((r) => (
            <div key={r._id} className="border-b border-mist pb-5">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{r.name}</p>
                <StarRating rating={r.rating} size={12} />
              </div>
              <p className="text-sm text-ink/60">{r.comment}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submitReview} className="bg-white border border-mist rounded-lg p-6">
          <h3 className="font-medium mb-4">Write a review</h3>
          <div className="mb-4">
            <label className="text-sm mb-2 block">Rating</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              className="input-field w-32"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} star{r > 1 && "s"}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-sm mb-2 block">Comment</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={3}
              required
              className="input-field"
              placeholder="Share your experience with this product..."
            />
          </div>
          <button type="submit" disabled={submittingReview} className="btn-primary">
            {submittingReview ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
