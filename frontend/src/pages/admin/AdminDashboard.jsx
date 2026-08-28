import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRupeeSign, FaBoxOpen, FaShoppingCart } from "react-icons/fa";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders/stats/summary");
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;

  const cards = [
    { label: "Total revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: FaRupeeSign },
    { label: "Total orders", value: stats.totalOrders, icon: FaShoppingCart },
    {
      label: "Pending / Processing",
      value: stats.statusBreakdown.filter((s) => ["Pending", "Processing"].includes(s._id)).reduce((a, s) => a + s.count, 0),
      icon: FaBoxOpen,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-mist rounded-lg p-5">
            <c.icon className="text-brass mb-3" size={20} />
            <p className="text-2xl font-display">{c.value}</p>
            <p className="text-xs text-ink/50 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-mist rounded-lg p-5 mb-10">
        <h2 className="font-medium mb-4">Order status breakdown</h2>
        <div className="flex flex-wrap gap-3">
          {stats.statusBreakdown.map((s) => (
            <div key={s._id} className="px-4 py-2 bg-mist rounded-md text-sm">
              <span className="font-semibold">{s.count}</span> <span className="text-ink/60">{s._id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-mist rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs font-medium text-ink underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/40 text-xs uppercase">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o._id} className="border-t border-mist">
                  <td className="py-3 font-mono text-xs">#{o._id.slice(-8)}</td>
                  <td className="py-3">{o.user?.name}</td>
                  <td className="py-3">{o.orderStatus}</td>
                  <td className="py-3 text-right font-mono">₹{o.totalPrice.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
