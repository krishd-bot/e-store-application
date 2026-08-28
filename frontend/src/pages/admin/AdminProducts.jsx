import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Products</h1>
        <Link to="/admin/products/new" className="btn-primary inline-flex items-center gap-2 text-sm">
          <FaPlus size={12} /> Add product
        </Link>
      </div>

      {loading ? (
        <Loader label="Loading products" />
      ) : (
        <div className="bg-white border border-mist rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/40 text-xs uppercase bg-mist/50">
                <th className="p-3">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-mist">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url || "https://placehold.co/60x60/E7E3DB/14213D"} alt="" className="w-10 h-10 rounded object-cover bg-mist" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-ink/40">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono">₹{p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-sage/20 text-sage" : "bg-rose/10 text-rose"}`}>
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-ink/60 hover:text-ink">
                        <FaEdit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="text-ink/60 hover:text-rose">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center text-ink/50 py-10">No products yet.</p>}
        </div>
      )}
    </div>
  );
}
