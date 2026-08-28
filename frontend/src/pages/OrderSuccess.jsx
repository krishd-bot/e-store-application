import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader label="Loading order" />;
  if (!order) return <p className="text-center py-24 text-ink/50">Order not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <FaCheckCircle className="text-sage mx-auto mb-5" size={48} />
      <h1 className="font-display text-3xl mb-2">Order confirmed!</h1>
      <p className="text-ink/50 mb-8">
        Thank you, {order.shippingAddress.fullName.split(" ")[0]}. Your order has been placed successfully.
      </p>
      <div className="bg-white border border-mist rounded-lg p-6 text-left mb-8">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-ink/50">Order ID</span>
          <span className="font-mono">#{order._id}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-ink/50">Payment method</span>
          <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-ink/50">Status</span>
          <span className="font-medium">{order.orderStatus}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t border-mist pt-3">
          <span>Total paid</span>
          <span className="font-mono">₹{order.totalPrice.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <div className="flex gap-4 justify-center">
        <Link to="/profile" className="btn-primary">View my orders</Link>
        <Link to="/products" className="btn-secondary">Continue shopping</Link>
      </div>
    </div>
  );
}
