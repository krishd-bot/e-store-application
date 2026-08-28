import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(location.state?.from?.pathname || (user.role === "admin" ? "/admin" : "/"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl mb-2">Welcome back</h1>
      <p className="text-ink/50 mb-8 text-sm">Sign in to continue to Aurelia.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-ink/50 hover:text-ink">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-ink/50 mt-6 text-center">
        Don't have an account? <Link to="/register" className="text-ink font-medium">Create one</Link>
      </p>
    </div>
  );
}
