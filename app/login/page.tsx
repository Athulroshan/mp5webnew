/**
 * User Login Page
 * Authenticates against /api/auth/login, handles token storage & session state
 * Styled in Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MLogo from "@/components/ui/m-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@mpss.com");
  const [password, setPassword] = useState("user123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Invalid email or password");
      }

      if (json.data?.token) {
        localStorage.setItem("auth_token", json.data.token);
        localStorage.setItem("user", JSON.stringify(json.data.user));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/products");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F] flex flex-col justify-center items-center p-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="w-14 h-14 rounded-2xl border border-[#E8DAC8] bg-white p-1.5 flex items-center justify-center mx-auto shadow-xs hover:border-[#C8452A] transition-colors">
              <MLogo size={40} strokeColor="#C8452A" />
            </div>
          </Link>
          <p className="eyebrow-label mb-1">CLIENT ACCESS</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">
            Sign In to <span className="text-[#C8452A]">MPSS</span>
          </h1>
          <p className="text-xs text-[#7A746E] font-medium mt-1">
            Access your custom orders, 3D designs &amp; quality inspection tracking
          </p>
        </div>

        <Card className="rounded-[28px] border-[#E8DAC8] bg-white shadow-xs p-2 sm:p-4">
          <CardHeader className="space-y-1 pb-4 border-b border-[#E8DAC8]">
            <CardTitle className="text-base font-bold text-[#1F1F1F]">Account Credentials</CardTitle>
            <CardDescription className="text-xs text-[#7A746E]">Enter your email and password to continue</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3.5 bg-[#F7ECE9] border border-[#C8452A]/30 rounded-2xl flex items-center gap-2 text-xs text-[#C8452A] font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3.5 bg-[#EFF3EB] border border-[#4A5B38]/30 rounded-2xl flex items-center gap-2 text-xs text-[#4A5B38] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Sign in successful! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#7A746E]" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@mpss.com"
                    className="pl-10 bg-[#FBF3E8]/50 border-[#E8DAC8] rounded-full text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#7A746E]" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-[#FBF3E8]/50 border-[#E8DAC8] rounded-full text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F3E6D3] rounded-2xl text-xs text-[#1F1F1F] border border-[#E8DAC8] space-y-1">
                <p className="font-bold text-[#C8452A]">Demo User Account:</p>
                <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E8DAC8]">user@mpss.com</code> | Password: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E8DAC8]">user123</code></p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-pill-primary w-full py-3 shadow-sm"
              >
                {loading ? "Signing In..." : "Sign In to MPSS"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-2 text-xs text-[#7A746E]">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[#C8452A] font-bold hover:underline">
                  Create Account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
