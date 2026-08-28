import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaLock } from "react-icons/fa";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Dynamically loads the Razorpay Checkout.js script once
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const emptyAddress = { fullName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "India", phone: "" };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const buildOrderItems = () =>
    items.map((i) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    }));

  const requiredFilled = ["fullName", "line1", "city", "state", "postalCode", "phone"].every((k) => address[k]);

  const placeOrderPayload = () => ({
    orderItems: buildOrderItems(),
    shippingAddress: address,
    itemsPrice: subtotal,
    shippingPrice: shipping,
    taxPrice: tax,
    totalPrice: total,
  });

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) return toast.error("Could not load payment gateway. Check your connection.");

    setPlacing(true);
    try {
      const { data } = await api.post("/payment/create-order", { amount: total });
      const { order: razorpayOrder, key } = data;

      const rzp = new window.Razorpay({
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Aurelia",
        description: "Order payment",
        order_id: razorpayOrder.id,
        prefill: { name: address.fullName, email: user?.email, contact: address.phone },
        theme: { color: "#14213D" },
        handler: async (response) => {
          try {
            const { data: verifyData } = await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...placeOrderPayload(),
            });
            clearCart();
            toast.success("Payment successful! Order placed.");
            navigate(`/order-success/${verifyData.order._id}`);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          } finally {
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not initiate payment");
      setPlacing(false);
    }
  };

  const handleCodOrder = async () => {
    setPlacing(true);
    try {
      const { data } = await api.post("/payment/cod", placeOrderPayload());
      clearCart();
      toast.success("Order placed with Cash on Delivery");
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requiredFilled) return toast.error("Please fill in all required address fields");
    if (items.length === 0) return toast.error("Your cart is empty");
    if (paymentMethod === "razorpay") handleRazorpayPayment();
    else handleCodOrder();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-ink/50">Your cart is empty — nothing to check out.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-8">
          <div className="bg-white border border-mist rounded-lg p-6">
            <h2 className="font-display text-lg mb-4">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="input-field sm:col-span-2" />
              <input required placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="input-field sm:col-span-2" />
              <input placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="input-field sm:col-span-2" />
              <input required placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field" />
              <input required placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input-field" />
              <input required placeholder="Postal code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="input-field" />
              <input required placeholder="Phone number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="input-field" />
            </div>
          </div>

          <div className="bg-white border border-mist rounded-lg p-6">
            <h2 className="font-display text-lg mb-4">Payment method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 border border-mist rounded-md p-4 cursor-pointer has-[:checked]:border-ink">
                <input type="radio" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-ink" />
                <div>
                  <p className="text-sm font-medium">Pay online (Razorpay)</p>
                  <p className="text-xs text-ink/50">Cards, UPI, Netbanking &amp; wallets</p>
                </div>
              </label>
              <label className="flex items-center gap-3 border border-mist rounded-md p-4 cursor-pointer has-[:checked]:border-ink">
                <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-ink" />
                <div>
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-xs text-ink/50">Pay when your order arrives</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white border border-mist rounded-lg p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg mb-4">Order summary</h2>
          <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={`${i.product}-${i.size}-${i.color}`} className="flex justify-between text-sm">
                <span className="text-ink/70 truncate pr-2">{i.name} × {i.quantity}</span>
                <span className="font-mono shrink-0">₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm text-ink/70 border-t border-mist pt-4 mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-mist pt-4 mb-6">
            <span>Total</span><span className="font-mono">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button type="submit" disabled={placing} className="btn-brass w-full flex items-center justify-center gap-2">
            <FaLock size={12} /> {placing ? "Processing..." : paymentMethod === "razorpay" ? "Pay now" : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}
