import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaTruck, FaShieldAlt, FaLeaf } from "react-icons/fa";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: prodData }, { data: catData }] = await Promise.all([
          api.get("/products/featured"),
          api.get("/categories"),
        ]);
        setFeatured(prodData.products);
        setCategories(catData.categories.slice(0, 4));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brass text-xs tracking-[0.3em] uppercase mb-4">New Season Edit</p>
            <h1 className="font-display text-4xl md:text-6xl text-paper leading-[1.1] mb-6">
              Everyday objects,<br /> made to <em className="text-brass not-italic">last</em>.
            </h1>
            <p className="text-paper/60 text-base md:text-lg max-w-md mb-8 leading-relaxed">
              Aurelia curates honest, well-made goods for the home and self — sourced from makers who care about the
              details as much as you do.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-brass inline-flex items-center gap-2">
                Shop the collection <FaArrowRight size={13} />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 text-paper border border-paper/30 px-6 py-3 rounded-md hover:bg-paper/10 transition-colors">
                Our story
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-mist">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1000&auto=format&fit=crop"
                alt="Curated Aurelia products arranged on a shelf"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-brass text-ink rounded-lg p-5 shadow-card hidden sm:block">
              <p className="font-display text-2xl">4.8/5</p>
              <p className="text-xs">from 2,300+ reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-mist bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: FaTruck, title: "Free delivery", desc: "On orders above ₹999" },
            { icon: FaShieldAlt, title: "Secure checkout", desc: "Razorpay encrypted payments" },
            { icon: FaLeaf, title: "Thoughtfully sourced", desc: "From independent makers" },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <f.icon className="text-brass" size={22} />
              <p className="font-medium text-sm">{f.title}</p>
              <p className="text-xs text-ink/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-16">
          <p className="section-eyebrow mb-2">Browse</p>
          <h2 className="font-display text-2xl md:text-3xl mb-8">Shop by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="group relative aspect-square rounded-lg overflow-hidden bg-mist"
              >
                <img
                  src={c.image?.url || "https://placehold.co/400x400/E7E3DB/14213D?text=" + c.name}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent flex items-end p-4">
                  <span className="text-paper font-display text-lg">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-eyebrow mb-2">Handpicked</p>
            <h2 className="font-display text-2xl md:text-3xl">Featured products</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-ink hover:text-brass hidden sm:inline-flex items-center gap-1">
            View all <FaArrowRight size={11} />
          </Link>
        </div>
        {loading ? (
          <Loader label="Loading featured products" />
        ) : featured.length === 0 ? (
          <p className="text-ink/50 text-sm">No featured products yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
