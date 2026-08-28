import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash, FaUpload } from "react-icons/fa";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (file) fd.append("image", file);
      await api.post("/categories", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Category created");
      setName("");
      setFile(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete — it may have products assigned");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Categories</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        {loading ? (
          <Loader label="Loading categories" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div key={c._id} className="bg-white border border-mist rounded-lg overflow-hidden">
                <div className="aspect-video bg-mist">
                  {c.image?.url && <img src={c.image.url} alt={c.name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{c.name}</span>
                  <button onClick={() => handleDelete(c._id)} className="text-ink/40 hover:text-rose">
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-mist rounded-lg p-5 space-y-3 h-fit">
          <h3 className="font-medium text-sm mb-1">Add category</h3>
          <input required placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <label className="flex items-center gap-2 border border-dashed border-mist rounded-md p-3 cursor-pointer text-sm text-ink/60 hover:border-ink">
            <FaUpload size={12} /> {file ? file.name : "Upload image"}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : "Add category"}
          </button>
        </form>
      </div>
    </div>
  );
}
