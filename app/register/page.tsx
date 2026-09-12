/**
 * User Registration / Signup Page
 * Creates customer account via /api/auth/register
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Registration failed");
      }

      if (json.data?.token) {
        localStorage.setItem("auth_token", json.data.token);
        localStorage.setItem("user", JSON.stringify(json.data.user));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/products");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Could not register account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 pt-20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg text-white mb-4">
            <User className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl text-slate-900 font-light">Create MPSS Account</h1>
          <p className="text-sm text-slate-500 font-light mt-1">Join to save custom apparel designs &amp; track orders</p>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader className="space-y-1 pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-normal text-slate-900">Registration Details</CardTitle>
            <CardDescription className="font-light text-xs">Fill out your details to create a new customer account</CardDescription>
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
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-light">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="pl-9 bg-white font-light text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-light">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="pl-9 bg-white font-light text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-light">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
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
                    placeholder="Minimum 6 characters"
                    className="pl-9 bg-white font-light text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-light py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500 font-light">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-700 hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
