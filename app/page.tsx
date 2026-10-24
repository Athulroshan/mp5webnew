"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList, Zap } from "lucide-react";
import MLogo from "@/components/ui/m-logo";

export default function HomePage() {
  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#FBF3E8] text-[#1F1F1F] flex flex-col justify-between p-6 sm:p-10 lg:px-16 lg:py-8 relative selection:bg-[#C8452A] selection:text-white">
      {/* ── Background Organic Shapes & Blob Accents ── */}
      <div
        className="absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full bg-[#F3E6D3]/70 blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-[#F3E6D3]/50 blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      {/* Thin curved terracotta line accent in bottom-left */}
      <svg
        className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none z-0 opacity-40"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M -20 280 C 60 280, 140 220, 160 140 C 170 100, 180 30, 240 -10"
          stroke="#C8452A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M -40 320 C 50 320, 160 260, 190 170"
          stroke="#C8452A"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.4"
        />
      </svg>

      {/* Small floating terracotta slanted pill accent near the collage */}
      <div
        className="hidden lg:block absolute top-14 left-[48%] xl:left-[50%] w-4 h-14 rounded-full bg-[#C8452A] rotate-[24deg] shadow-xs z-20"
        aria-hidden="true"
      />

      {/* ── Top-Left: Company Logo & Minimal Branding ── */}
      <header className="relative z-30 w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[#E8DAC8] bg-[#FBF3E8] p-1 shadow-xs group-hover:border-[#C8452A] transition-colors">
            <MLogo
              size={38}
              strokeColor="#1F1F1F"
              className="group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#1F1F1F] leading-tight">
              MPSS
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A746E]">
              My Profile Sourcing Solutions
            </span>
          </div>
        </Link>
      </header>

      {/* ── Main Single-Screen Hero (No Scrolling) ── */}
      <main className="relative z-10 w-full flex-1 flex items-center my-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 xl:gap-16">
          {/* Left Column: Eyebrow + Heading + Paragraph + 2 Buttons */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center max-w-xl">
            {/* Eyebrow Label */}
            <p className="eyebrow-label mb-3 sm:mb-4">
              CUSTOM APPAREL &amp; QUALITY INSPECTION SERVICES
            </p>

            {/* Two-Tone H1 Heading: My Profile / Sourcing Solutions */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[64px] font-black tracking-[-0.035em] leading-[1.06] text-[#1F1F1F] mb-5">
              My Profile <br />
              <span className="text-[#C8452A]">Sourcing Solutions</span>
            </h1>

            {/* Short Paragraph */}
            <p className="text-body-warm text-sm sm:text-base lg:text-lg mb-7 sm:mb-8 max-w-[500px]">
              We help brands source and manufacture quality apparel from trusted factories,
              with reliable inspection services at every stage — so you can focus on what you do best.
            </p>

            {/* Two Pill Buttons: Products & Services */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              {/* Secondary Pill Button: Products */}
              <Link
                href="/products"
                id="hero-products-pill"
                className="btn-pill-secondary group px-7 py-3 text-sm font-bold inline-flex items-center gap-2.5"
              >
                <ClipboardList className="w-4 h-4 text-[#C8452A] group-hover:scale-110 transition-transform" />
                <span>Products</span>
              </Link>

              {/* Primary Pill Button: Services */}
              <Link
                href="/services"
                id="hero-services-pill"
                className="btn-pill-primary group px-7 py-3 text-sm font-bold inline-flex items-center gap-2.5"
              >
                <Zap className="w-4 h-4 text-white fill-current group-hover:scale-110 transition-transform" />
                <span>Services</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Image Collage from Reference */}
          <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[520px] lg:max-w-none lg:w-[110%] lg:-mr-12 xl:-mr-16">
              {/* Responsive Collage with clean warm border and rounded edges */}
              <div className="relative rounded-[24px] lg:rounded-l-[32px] lg:rounded-r-none overflow-hidden border border-[#E8DAC8]/90 lg:border-r-0 shadow-[0_20px_50px_-15px_rgba(74,69,64,0.18)]">
                <img
                  src="/hero-collage.jpg"
                  alt="Apparel craftsmanship and quality inspection: sewing machine operator, folded tees, fabric swatches and measuring tape"
                  className="w-full max-h-[50vh] sm:max-h-[58vh] lg:max-h-[66vh] xl:max-h-[70vh] object-cover transition-transform duration-700 hover:scale-[1.01]"
                />

                {/* Floating AQL 2.5 Quality Badge */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#E8DAC8] shadow-xs flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C8452A] animate-pulse" />
                  <span className="text-xs font-bold text-[#1F1F1F]">
                    AQL 2.5 Certified Inspection
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean bottom buffer */}
      <div className="w-full h-2" aria-hidden="true" />
    </div>
  );
}
