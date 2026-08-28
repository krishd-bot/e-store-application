import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FaFilter, FaTimes } from "react-icons/fa";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const page = Number(searchParams.get("page")) || 1;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: Object.fromEntries(searchParams) });
      setProducts(data.products);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    (async () => {
      const [{ data: catData }, { data: brandData }] = await Promise.all([
        api.get("/categories"),
        api.get("/products/meta/brands"),
      ]);
      setCategories(catData.categories);
      setBrands(brandData.brands);
    })();
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const toggleListParam = (key, value) => {
    const current = searchParams.get(key)?.split(",").filter(Boolean) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateParam(key, next.join(","));
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set("minPrice", minPrice); else next.delete("minPrice");
    if (maxPrice) next.set("maxPrice", maxPrice); else next.delete("maxPrice");
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  const activeSizes = searchParams.get("sizes")?.split(",").filter(Boolean) || [];
  const activeColors = searchParams.get("colors")?.split(",").filter(Boolean) || [];
  const activeFilterCount =
    [...searchParams.keys()].filter((k) => !["page", "sort", "keyword"].includes(k)).length;

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-sm mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c._id} className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={searchParams.get("category") === c._id}
                onChange={() => updateParam("category", c._id)}
                className="accent-ink"
              />
              {c.name}
            </label>
          ))}
          {searchParams.get("category") && (
            <button onClick={() => updateParam("category", "")} className="text-xs text-brass underline">
              Clear category
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-3">Price range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-field text-sm py-1.5"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field text-sm py-1.5"
          />
        </div>
        <button onClick={applyPriceFilter} className="mt-2 text-xs font-medium text-ink underline">
          Apply
        </button>
      </div>

      {brands.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Brand</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {brands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  checked={searchParams.get("brand") === b}
                  onChange={() => updateParam("brand", b)}
                  className="accent-ink"
                />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-sm mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
            <button
              key={s}
              onClick={() => toggleListParam("sizes", s)}
              className={`w-9 h-9 text-xs rounded border ${
                activeSizes.includes(s) ? "bg-ink text-paper border-ink" : "border-mist text-ink/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-3">Color</h4>
        <div className="flex flex-wrap gap-2">
          {["Black", "White", "Beige", "Navy", "Green", "Red"].map((c) => (
            <button
              key={c}
              onClick={() => toggleListParam("colors", c)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                activeColors.includes(c) ? "bg-ink text-paper border-ink" : "border-mist text-ink/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-3">Minimum rating</h4>
        <div className="flex gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => updateParam("rating", searchParams.get("rating") === String(r) ? "" : String(r))}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                searchParams.get("rating") === String(r) ? "bg-ink text-paper border-ink" : "border-mist text-ink/60"
              }`}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="text-sm text-rose font-medium">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-eyebrow mb-1">Shop</p>
          <h1 className="font-display text-2xl md:text-3xl">
            {searchParams.get("keyword") ? `Results for "${searchParams.get("keyword")}"` : "All products"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={searchParams.get("sort") || "newest"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="input-field text-sm py-2 w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden flex items-center gap-2 border border-mist rounded-md px-3 py-2 text-sm"
          >
            <FaFilter size={12} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block">{FilterPanel}</aside>

        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-paper p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}><FaTimes /></button>
              </div>
              {FilterPanel}
            </div>
          </div>
        )}

        <div>
          {loading ? (
            <Loader label="Loading products" />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-ink/50 mb-4">No products match your filters.</p>
              <button onClick={clearFilters} className="btn-secondary">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam("page", String(p))}
                      className={`w-9 h-9 rounded text-sm ${
                        page === p ? "bg-ink text-paper" : "border border-mist text-ink/60"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
