import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created! Welcome to Aurelia.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl mb-2">Create an account</h1>
      <p className="text-ink/50 mb-8 text-sm">Join Aurelia to track orders and save your favorites.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />
        <input required type="password" placeholder="Confirm password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field" />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-ink/50 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-ink font-medium">Sign in</Link>
      </p>
    </div>
  );
}
