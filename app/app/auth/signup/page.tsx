"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create profile
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        phone,
      });

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSuccess(true);
      }
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="card p-8 text-center animate-scale-in">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-display text-xl font-bold text-sage-900 mb-2">Check your email</h2>
        <p className="text-sage-500 text-sm font-body">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/auth/login" className="btn-secondary mt-6 inline-block">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8 animate-scale-in">
      <h1 className="font-display text-2xl font-bold text-sage-900 mb-1">Create your account</h1>
      <p className="text-sage-500 text-sm mb-8 font-body">Join PawDays and start booking for your pets</p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            className="input"
            placeholder="Jane Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
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
          <label className="label">Phone (optional)</label>
          <input
            type="tel"
            className="input"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        {error && (
          <div className="bg-clay-100 border border-clay-200 text-clay-500 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? "Creating account..." : "Create account →"}
        </button>
      </form>

      <p className="text-center text-sm text-sage-500 mt-6 font-body">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-sage-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
