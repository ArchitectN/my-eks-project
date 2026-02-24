"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="card p-8 animate-scale-in">
      <h1 className="font-display text-2xl font-bold text-sage-900 mb-1">Welcome back</h1>
      <p className="text-sage-500 text-sm mb-8 font-body">Sign in to manage your pets & bookings</p>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="bg-clay-100 border border-clay-200 text-clay-500 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign in →"}
        </button>
      </form>

      <p className="text-center text-sm text-sage-500 mt-6 font-body">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-sage-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
