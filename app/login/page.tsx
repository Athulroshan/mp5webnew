/**
 * User Login Page
 * Authenticates against /api/auth/login, handles token storage & session state
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 pt-20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg text-white mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl text-slate-900 font-light">Customer Sign In</h1>
          <p className="text-sm text-slate-500 font-light mt-1">Access your saved custom designs, orders &amp; delivery tracking</p>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader className="space-y-1 pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-normal text-slate-900">Account Credentials</CardTitle>
            <CardDescription className="font-light text-xs">Enter your email and password to continue</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Sign in successful! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-light">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@mpss.com"
                    className="pl-9 bg-white font-light text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-light">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-white font-light text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1 font-light">
                <p className="font-normal">Demo User Account:</p>
                <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border">user@mpss.com</code> | Password: <code className="bg-white px-1.5 py-0.5 rounded border">user123</code></p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-light py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {loading ? "Signing In..." : "Sign In to MPSS"}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500 font-light">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-emerald-700 hover:underline">
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
