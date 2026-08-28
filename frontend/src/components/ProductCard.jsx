import { Link } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";
import Price from "./Price.jsx";
import StarRating from "./StarRating.jsx";
import { useCart } from "../context/CartContext.jsx";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const image = product.images?.[0]?.url || "https://placehold.co/500x500/E7E3DB/14213D?text=Aurelia";

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (product.stock < 1) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-card hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-mist">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.discountPrice > 0 && (
          <span className="absolute top-3 left-3 bg-rose text-white text-[11px] font-semibold px-2 py-1 rounded">
            SALE
          </span>
        )}
        {product.stock < 1 && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="text-paper text-sm tracking-wide uppercase">Out of stock</span>
          </div>
        )}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock < 1}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 bg-ink text-paper w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-0 hover:bg-brass hover:text-ink"
        >
          <FaShoppingBag size={14} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-ink/40 mb-1">{product.brand}</p>
        <h3 className="font-display text-[15px] text-ink truncate mb-1">{product.name}</h3>
        {product.numReviews > 0 && (
          <div className="mb-1.5">
            <StarRating rating={product.rating} count={product.numReviews} size={11} />
          </div>
        )}
        <Price price={product.price} discountPrice={product.discountPrice} />
      </div>
    </Link>
  );
}
