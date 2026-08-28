import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl mb-2">Reset your password</h1>
      <p className="text-ink/50 mb-8 text-sm">Enter your email and we'll send you a reset link.</p>
      {sent ? (
        <p className="text-sage text-sm bg-sage/10 border border-sage/30 rounded-md p-4">
          If an account exists for that email, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
}
