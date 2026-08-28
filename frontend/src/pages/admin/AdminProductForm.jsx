import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaTimes, FaUpload } from "react-icons/fa";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

const emptyForm = {
  name: "", description: "", brand: "", category: "", price: "", discountPrice: "",
  stock: "", sku: "", sizes: "", colors: "", tags: "", isFeatured: false, isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: catData } = await api.get("/categories");
      setCategories(catData.categories);

      if (isEdit) {
        const { data } = await api.get(`/products/${id}`);
        const p = data.product;
        setForm({
          name: p.name, description: p.description, brand: p.brand || "",
          category: p.category?._id || "", price: p.price, discountPrice: p.discountPrice || "",
          stock: p.stock, sku: p.sku || "", sizes: (p.sizes || []).join(","),
          colors: (p.colors || []).join(","), tags: (p.tags || []).join(","),
          isFeatured: p.isFeatured, isActive: p.isActive,
        });
        setExistingImages(p.images || []);
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    setNewFiles([...e.target.files]);
  };

  const toggleRemoveImage = (publicId) => {
    setRemoveIds((prev) => (prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newFiles.forEach((f) => fd.append("images", f));
      if (removeIds.length) fd.append("removeImagePublicIds", JSON.stringify(removeIds));

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated");
      } else {
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading product" />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{isEdit ? "Edit product" : "Add new product"}</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-mist rounded-lg p-6 space-y-5 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <input required name="name" placeholder="Product name" value={form.name} onChange={handleChange} className="input-field sm:col-span-2" />
          <select required name="category" value={form.category} onChange={handleChange} className="input-field">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} className="input-field" />
        </div>

        <textarea required name="description" placeholder="Description" rows={4} value={form.description} onChange={handleChange} className="input-field" />

        <div className="grid sm:grid-cols-3 gap-4">
          <input required type="number" min="0" step="0.01" name="price" placeholder="Price (₹)" value={form.price} onChange={handleChange} className="input-field" />
          <input type="number" min="0" step="0.01" name="discountPrice" placeholder="Discount price (₹)" value={form.discountPrice} onChange={handleChange} className="input-field" />
          <input required type="number" min="0" name="stock" placeholder="Stock quantity" value={form.stock} onChange={handleChange} className="input-field" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input name="sku" placeholder="SKU (optional)" value={form.sku} onChange={handleChange} className="input-field" />
          <input name="tags" placeholder="Tags, comma separated" value={form.tags} onChange={handleChange} className="input-field" />
          <input name="sizes" placeholder="Sizes e.g. S,M,L,XL" value={form.sizes} onChange={handleChange} className="input-field" />
          <input name="colors" placeholder="Colors e.g. Black,White" value={form.colors} onChange={handleChange} className="input-field" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="accent-ink" />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-ink" />
            Active / visible to customers
          </label>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Product images</p>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {existingImages.map((img) => (
                <div key={img.publicId} className="relative">
                  <img src={img.url} alt="" className={`w-20 h-20 rounded object-cover ${removeIds.includes(img.publicId) ? "opacity-30" : ""}`} />
                  <button
                    type="button"
                    onClick={() => toggleRemoveImage(img.publicId)}
                    className="absolute -top-2 -right-2 bg-rose text-white w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    <FaTimes size={9} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 border border-dashed border-mist rounded-md p-4 cursor-pointer text-sm text-ink/60 hover:border-ink w-fit">
            <FaUpload size={13} /> Upload images (Cloudinary)
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          {newFiles.length > 0 && <p className="text-xs text-ink/50 mt-2">{newFiles.length} new file(s) selected</p>}
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Update product" : "Create product"}
        </button>
      </form>
    </div>
  );
}
