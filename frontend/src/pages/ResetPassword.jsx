import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset. Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl mb-2">Set a new password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-8">
        <input required type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
