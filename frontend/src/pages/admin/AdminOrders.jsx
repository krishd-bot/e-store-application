import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

const STATUSES = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: { status: filter || undefined, limit: 100 } });
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status, note: `Marked as ${status} by admin` });
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader label="Loading orders" />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border border-mist rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm">#{o._id}</p>
                  <p className="text-xs text-ink/40">{o.user?.name} · {o.user?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold">₹{o.totalPrice.toLocaleString("en-IN")}</span>
                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="input-field w-auto text-xs py-1.5"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                    className="text-xs text-ink underline"
                  >
                    {expanded === o._id ? "Hide" : "Details"}
                  </button>
                </div>
              </div>

              {expanded === o._id && (
                <div className="mt-4 pt-4 border-t border-mist grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-ink/50 uppercase mb-2">Items</p>
                    {o.orderItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-mono">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink/50 uppercase mb-2">Shipping address</p>
                    <p className="text-sm text-ink/70">
                      {o.shippingAddress.fullName}<br />
                      {o.shippingAddress.line1}, {o.shippingAddress.city}<br />
                      {o.shippingAddress.state} {o.shippingAddress.postalCode}<br />
                      {o.shippingAddress.phone}
                    </p>
                    <p className="text-xs font-medium text-ink/50 uppercase mt-4 mb-2">Tracking history</p>
                    <ul className="text-xs text-ink/60 space-y-1">
                      {o.trackingHistory?.map((t, i) => (
                        <li key={i}>{new Date(t.updatedAt).toLocaleString("en-IN")} — {t.status}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-ink/50 py-10">No orders found.</p>}
        </div>
      )}
    </div>
  );
}
