import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaBox, FaMapMarkerAlt, FaUserCircle, FaTrash } from "react-icons/fa";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

const STATUS_COLORS = {
  Pending: "bg-mist text-ink/60",
  Processing: "bg-brass/20 text-brass",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-blue-100 text-blue-700",
  Delivered: "bg-sage/20 text-sage",
  Cancelled: "bg-rose/10 text-rose",
};

const TABS = [
  { key: "orders", label: "Orders", icon: FaBox },
  { key: "addresses", label: "Addresses", icon: FaMapMarkerAlt },
  { key: "account", label: "Account", icon: FaUserCircle },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({ label: "Home", line1: "", city: "", state: "", postalCode: "", phone: "" });
  const [name, setName] = useState(user?.name || "");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data.orders);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cancelOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, orderStatus: "Cancelled" } : o)));
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order");
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/users/addresses", newAddress);
      setAddresses(data.addresses);
      setNewAddress({ label: "Home", line1: "", city: "", state: "", postalCode: "", phone: "" });
      toast.success("Address added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add address");
    }
  };

  const removeAddress = async (id) => {
    const { data } = await api.delete(`/users/addresses/${id}`);
    setAddresses(data.addresses);
  };

  const updateName = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/profile", { name });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display text-3xl mb-2">My account</h1>
      <p className="text-ink/50 mb-8">{user?.email}</p>

      <div className="flex gap-2 border-b border-mist mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 -mb-px ${
              tab === t.key ? "border-ink text-ink font-medium" : "border-transparent text-ink/50"
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        loading ? <Loader label="Loading orders" /> : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink/50 mb-4">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o._id} className="bg-white border border-mist rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-medium font-mono">#{o._id}</p>
                    <p className="text-xs text-ink/40">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[o.orderStatus]}`}>
                    {o.orderStatus}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
                  {o.orderItems.slice(0, 4).map((item, i) => (
                    <img key={i} src={item.image || "https://placehold.co/80x80/E7E3DB/14213D"} alt={item.name} className="w-12 h-12 rounded object-cover bg-mist" />
                  ))}
                  {o.orderItems.length > 4 && (
                    <div className="w-12 h-12 rounded bg-mist flex items-center justify-center text-xs text-ink/50">
                      +{o.orderItems.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-semibold text-sm">₹{o.totalPrice.toLocaleString("en-IN")}</p>
                  <div className="flex gap-3">
                    <Link to={`/order-success/${o._id}`} className="text-xs font-medium text-ink underline">
                      View details
                    </Link>
                    {["Pending", "Processing"].includes(o.orderStatus) && (
                      <button onClick={() => cancelOrder(o._id)} className="text-xs font-medium text-rose underline">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "addresses" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {addresses.length === 0 && <p className="text-ink/50 text-sm">No saved addresses yet.</p>}
            {addresses.map((a) => (
              <div key={a._id} className="bg-white border border-mist rounded-lg p-4 flex justify-between">
                <div className="text-sm">
                  <p className="font-medium">{a.label}</p>
                  <p className="text-ink/60">{a.line1}, {a.city}, {a.state} {a.postalCode}</p>
                  <p className="text-ink/40 text-xs">{a.phone}</p>
                </div>
                <button onClick={() => removeAddress(a._id)} className="text-ink/30 hover:text-rose">
                  <FaTrash size={13} />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={addAddress} className="bg-white border border-mist rounded-lg p-5 space-y-3 h-fit">
            <h3 className="font-medium text-sm mb-1">Add new address</h3>
            <input required placeholder="Label (Home, Work...)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="input-field" />
            <input required placeholder="Address line" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} className="input-field" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="input-field" />
              <input required placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Postal code" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="input-field" />
              <input required placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="input-field" />
            </div>
            <button type="submit" className="btn-primary w-full">Save address</button>
          </form>
        </div>
      )}

      {tab === "account" && (
        <div className="max-w-md space-y-8">
          <form onSubmit={updateName} className="bg-white border border-mist rounded-lg p-5 space-y-3">
            <h3 className="font-medium text-sm mb-1">Update name</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            <button type="submit" className="btn-primary w-full">Save changes</button>
          </form>
          <button onClick={logout} className="btn-secondary w-full">Sign out</button>
        </div>
      )}
    </div>
  );
}
