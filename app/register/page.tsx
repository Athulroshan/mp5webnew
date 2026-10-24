/**
 * User Registration / Signup Page
 * Creates customer account via /api/auth/register
 * Styled in Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MLogo from "@/components/ui/m-logo";

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
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F] flex flex-col justify-center items-center p-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="w-14 h-14 rounded-2xl border border-[#E8DAC8] bg-white p-1.5 flex items-center justify-center mx-auto shadow-xs hover:border-[#C8452A] transition-colors">
              <MLogo size={40} strokeColor="#C8452A" />
            </div>
          </Link>
          <p className="eyebrow-label mb-1">NEW CUSTOMER REGISTRATION</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">
            Create MPSS <span className="text-[#C8452A]">Account</span>
          </h1>
          <p className="text-xs text-[#7A746E] font-medium mt-1">
            Join to save custom apparel designs &amp; track quality inspections
          </p>
        </div>

        <Card className="rounded-[28px] border-[#E8DAC8] bg-white shadow-xs p-2 sm:p-4">
          <CardHeader className="space-y-1 pb-4 border-b border-[#E8DAC8]">
            <CardTitle className="text-base font-bold text-[#1F1F1F]">Registration Details</CardTitle>
            <CardDescription className="text-xs text-[#7A746E]">Fill out your details to create a new customer account</CardDescription>
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
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#7A746E]" />
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="pl-10 bg-[#FBF3E8]/50 border-[#E8DAC8] rounded-full text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#7A746E]" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="pl-10 bg-[#FBF3E8]/50 border-[#E8DAC8] rounded-full text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#7A746E]" />
                  <Input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
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
                    placeholder="Minimum 6 characters"
                    className="pl-10 bg-[#FBF3E8]/50 border-[#E8DAC8] rounded-full text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-pill-primary w-full py-3 shadow-sm"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-2 text-xs text-[#7A746E]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#C8452A] font-bold hover:underline">
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
