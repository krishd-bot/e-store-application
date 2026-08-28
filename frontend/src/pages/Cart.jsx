import { Link, useNavigate } from "react-router-dom";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) return navigate("/login", { state: { from: { pathname: "/checkout" } } });
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">Your cart is empty</h1>
        <p className="text-ink/50 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">Your cart</h1>
      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={`${item.product}-${item.size}-${item.color}`} className="flex gap-4 bg-white border border-mist rounded-lg p-4">
              <img
                src={item.image || "https://placehold.co/150x150/E7E3DB/14213D?text=Aurelia"}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-md bg-mist shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  <button
                    onClick={() => removeFromCart(item.product, item.size, item.color)}
                    className="text-ink/30 hover:text-rose shrink-0"
                    aria-label="Remove item"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
                <p className="text-xs text-ink/40 mt-1">
                  {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 border border-mist rounded-md">
                    <button
                      onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity - 1)}
                      className="p-2 text-ink/60"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product, item.size, item.color, item.quantity + 1)}
                      className="p-2 text-ink/60"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                  <p className="font-mono font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-mist rounded-lg p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg mb-4">Order summary</h2>
          <div className="space-y-2 text-sm text-ink/70 mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
            <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-mist pt-4 mb-6">
            <span>Total</span><span className="font-mono">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button onClick={handleCheckout} className="btn-primary w-full">Proceed to checkout</button>
          <Link to="/products" className="block text-center text-sm text-ink/50 mt-4 hover:text-ink">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
