"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mpss.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        throw new Error(json.message || "Invalid login credentials");
      }

      if (json.data?.user?.role !== "admin") {
        throw new Error("Access denied: You do not have admin permissions.");
      }

      // Store token locally and redirect
      if (json.data?.token) {
        localStorage.setItem("auth_token", json.data.token);
        localStorage.setItem("user", JSON.stringify(json.data.user));
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg text-white mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl tracking-tight text-slate-900">MPSS Admin Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage products, orders & view analytics</p>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader className="space-y-1 pb-4 border-b border-slate-100">
            <CardTitle className="text-lg">Admin Authentication</CardTitle>
            <CardDescription>Enter your administrator credentials below</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-700 uppercase tracking-wider">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mpss.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <p>Demo Credentials:</p>
                <p>Email: <code className="bg-amber-100 px-1 rounded">admin@mpss.com</code> | Password: <code className="bg-amber-100 px-1 rounded">admin123</code></p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {loading ? "Authenticating..." : "Sign In to Admin"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
