"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";
import { login } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-brand-red" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-wide">Admin Login</h1>
          <p className="text-gray-500 text-xs mt-1">DesignTouch+ Content Management</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            autoFocus
            placeholder="Username"
            className="bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Password"
            className="bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
          />

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-red-600 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-lg transition-colors cursor-pointer border-none mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
            <LogIn className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </main>
  );
}
