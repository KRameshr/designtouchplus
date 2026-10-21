"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const username = form.username.trim();
    if (!username || !form.password) {
      setError("Please enter both your username and password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(username, form.password);
      // replace: the login screen should not sit in history behind the dashboard
      router.replace("/admin/dashboard");
    } catch (err) {
      // lib/auth.js only throws pre-written, user-safe messages
      setError(err.message || "Login failed. Please try again.");
      setForm((prev) => ({ ...prev, password: "" }));
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full min-w-0 bg-black/60 border border-white/10 focus:border-brand-red rounded-none px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors disabled:opacity-60";
  const labelClasses =
    "block text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#0a0a0a] text-white flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md">
        {/* Masthead */}
        <div className="mb-6 select-none">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-brand-red inline-block shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
              Restricted // Admin Access
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em]">
            Admin
            <br />
            Sign <span className="text-brand-red">In.</span>
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-3">
            DesignTouch+ content management panel.
          </p>
        </div>

        {/* Form panel */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-[#0d0d0d] border border-white/[0.08] p-5 sm:p-7"
          aria-describedby={error ? "login-error" : undefined}
        >
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
            <span className="text-xs font-bold uppercase tracking-widest font-display">Credentials</span>
            <span className="text-[10px] font-mono text-neutral-500">JWT // SECURE</span>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className={labelClasses}>
              Username
            </label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
              disabled={loading}
              aria-invalid={Boolean(error) && !form.username.trim()}
              className={inputClasses}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                aria-invalid={Boolean(error) && !form.password}
                className={`${inputClasses} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors focus:outline-none focus-visible:text-white disabled:opacity-50 cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="login-error"
              role="alert"
              className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 px-3.5 py-3 mb-5"
            >
              <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1.5" aria-hidden="true" />
              <span className="break-words min-w-0">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 disabled:cursor-wait text-white text-xs font-bold uppercase tracking-[0.16em] font-display py-4 rounded-none border border-brand-red transition-colors cursor-pointer"
          >
            <span>{loading ? "Signing In…" : "Sign In"}</span>
            {!loading && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                />
              </svg>
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-500">
          <Link href="/" className="no-underline text-neutral-500 hover:text-white transition-colors">
            ← Back to website
          </Link>
          <span>Authorized staff only</span>
        </div>
      </div>
    </main>
  );
}
