"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Zap, CheckCircle, ArrowUp } from "lucide-react";

const trustStatements = [
  { icon: CheckCircle, label: "Quality You Can Wear" },
  { icon: CheckCircle, label: "Trust You Can Rely On" },
  { icon: CheckCircle, label: "On-Time. Every Time." },
];

export default function HomePage() {
  const [hovered, setHovered] = useState<"products" | "services" | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between">
      <section
        className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #c8d8f8 0%, #d4c8f0 35%, #e8c8e8 65%, #f0c8d8 100%)",
        }}
      >
        {/* ── Decorative shapes ── */}
        {/* Top-left angled lines */}
        <svg
          className="absolute top-12 left-10 opacity-30 pointer-events-none"
          width="60"
          height="75"
          viewBox="0 0 60 75"
          fill="none"
        >
          <line x1="5" y1="0" x2="5" y2="75" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="20" y1="0" x2="20" y2="75" stroke="#6366f1" strokeWidth="1.5" />
          <line
            x1="12"
            y1="40"
            x2="12"
            y2="0"
            stroke="#6366f1"
            strokeWidth="1.5"
            transform="rotate(30 12 40)"
          />
        </svg>

        {/* Top-right crosshair */}
        <svg
          className="absolute top-12 right-12 opacity-25 pointer-events-none"
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
        >
          <circle cx="26" cy="26" r="11" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="26" y1="0" x2="26" y2="52" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="0" y1="26" x2="52" y2="26" stroke="#7c3aed" strokeWidth="1.5" />
        </svg>

        {/* Top-right small plus */}
        <svg
          className="absolute top-10 right-36 opacity-25 pointer-events-none"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <line x1="10" y1="0" x2="10" y2="20" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="0" y1="10" x2="20" y2="10" stroke="#6366f1" strokeWidth="1.5" />
        </svg>

        {/* Bottom-left leaf */}
        <svg
          className="absolute bottom-16 left-12 opacity-25 pointer-events-none"
          width="44"
          height="56"
          viewBox="0 0 44 56"
          fill="none"
        >
          <path
            d="M22 2 C3 11 3 45 22 54 C41 45 41 11 22 2Z"
            stroke="#6366f1"
            strokeWidth="1.5"
            fill="none"
          />
          <line x1="22" y1="2" x2="22" y2="54" stroke="#6366f1" strokeWidth="1.5" />
        </svg>

        {/* Bottom-right hexagon */}
        <svg
          className="absolute bottom-12 right-12 opacity-25 pointer-events-none"
          width="58"
          height="58"
          viewBox="0 0 58 58"
          fill="none"
        >
          <polygon
            points="29,3 55,17 55,41 29,55 3,41 3,17"
            stroke="#7c3aed"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 w-full max-w-4xl mx-auto my-auto">
          {/* Heading Line 1 */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-2"
            style={{ color: "#1e1b4b" }}
          >
            My Profile
          </h1>

          {/* Heading Line 2 */}
          <h2
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-6"
            style={{
              background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Sourcing Solutions
          </h2>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl font-normal mb-4"
            style={{ color: "#4b5563" }}
          >
            Custom Apparel &amp; Quality Inspection Services
          </p>

          {/* Accent line */}
          <div
            className="w-14 h-1 rounded-full mb-12"
            style={{
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
            }}
          />

          {/* Pill navigation buttons */}
          <div className="flex items-center justify-center gap-5 mb-16">
            {/* Products Pill */}
            <Link
              href="/products"
              onMouseEnter={() => setHovered("products")}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md hover:shadow-xl"
              style={{
                background:
                  hovered === "products"
                    ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                    : "#ffffff",
                color: hovered === "products" ? "#ffffff" : "#4f46e5",
                boxShadow:
                  hovered === "products"
                    ? "0 10px 30px rgba(99,102,241,0.40)"
                    : "0 4px 20px rgba(0,0,0,0.08)",
                transform:
                  hovered === "products" ? "scale(1.05)" : "scale(1)",
              }}
            >
              <ShoppingBag
                className="h-4 w-4"
                style={{
                  color: hovered === "products" ? "#ffffff" : "#4f46e5",
                }}
              />
              Products
            </Link>

            {/* Services Pill */}
            <Link
              href="/services"
              onMouseEnter={() => setHovered("services")}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md hover:shadow-xl"
              style={{
                background:
                  hovered === "services"
                    ? "#ffffff"
                    : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color: hovered === "services" ? "#4f46e5" : "#ffffff",
                boxShadow:
                  hovered === "services"
                    ? "0 4px 20px rgba(0,0,0,0.08)"
                    : "0 10px 30px rgba(99,102,241,0.40)",
                transform:
                  hovered === "services" ? "scale(1.05)" : "scale(1)",
              }}
            >
              <Zap
                className="h-4 w-4"
                style={{
                  color: hovered === "services" ? "#4f46e5" : "#ffffff",
                }}
              />
              Services
            </Link>
          </div>

          {/* Trust Statements Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-300/80">
            {trustStatements.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 sm:px-8 py-1 sm:py-0"
              >
                <t.icon
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: "#6366f1" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#374151" }}
                >
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll-to-top floating button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#0f172a] text-white flex items-center justify-center shadow-xl hover:bg-[#1e293b] transition-all hover:scale-110 active:scale-95"
          title="Scroll to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </section>
    </div>
  );
}


