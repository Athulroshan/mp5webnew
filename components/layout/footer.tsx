"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, ShieldCheck, RefreshCw, Award } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-slate-100 text-slate-700 border-t border-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Main Footer Links Columns (Matching Myntra Screenshot) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Col 1: ONLINE SHOPPING */}
          <div className="space-y-3">
            <h4 className="text-slate-900 uppercase tracking-wider text-xs">ONLINE SHOPPING</h4>
            <ul className="space-y-1.5 text-slate-600 font-normal">
              <li><Link href="/products?category=Sportswear" className="hover:text-slate-950">Sportswear</Link></li>
              <li><Link href="/products?category=Caps" className="hover:text-slate-950">Caps &amp; Headwear</Link></li>
              <li><Link href="/products?category=Round+Neck+T-Shirts" className="hover:text-slate-950">Round Neck T-Shirts</Link></li>
              <li><Link href="/products?category=Polo+T-Shirts" className="hover:text-slate-950">Polo T-Shirts</Link></li>
              <li><Link href="/products?category=Normal+T-Shirts" className="hover:text-slate-950">Normal T-Shirts</Link></li>
              <li><Link href="/products?category=Hoodies" className="hover:text-slate-950">Hoodies &amp; Jackets</Link></li>
              <li><Link href="/customization" className="hover:text-slate-950">Custom Design Studio</Link></li>
            </ul>
          </div>

          {/* Col 2: CUSTOMER POLICIES */}
          <div className="space-y-3">
            <h4 className="text-slate-900 uppercase tracking-wider text-xs">CUSTOMER POLICIES</h4>
            <ul className="space-y-1.5 text-slate-600 font-normal">
              <li><Link href="/contact" className="hover:text-slate-950">Contact Us</Link></li>
              <li><Link href="/track-order" className="hover:text-slate-950">Track Orders</Link></li>
              <li><Link href="/customization" className="hover:text-slate-950">Custom Bulk Orders</Link></li>
              <li><Link href="/admin/login" className="hover:text-slate-950">Admin Portal</Link></li>
              <li><Link href="/login" className="hover:text-slate-950">User Sign In</Link></li>
            </ul>
          </div>

          {/* Col 3: KEEP IN TOUCH */}
          <div className="space-y-3">
            <h4 className="text-slate-900 uppercase tracking-wider text-xs">KEEP IN TOUCH</h4>
            <div className="flex flex-wrap gap-2 text-slate-600">
              <span className="hover:text-slate-950 cursor-pointer">Facebook</span>
              <span>•</span>
              <span className="hover:text-slate-950 cursor-pointer">Twitter</span>
              <span>•</span>
              <span className="hover:text-slate-950 cursor-pointer">Instagram</span>
              <span>•</span>
              <span className="hover:text-slate-950 cursor-pointer">Youtube</span>
            </div>

            <div className="pt-2 space-y-1">
              <p className="text-slate-900 font-medium">Customer Support</p>
              <p className="text-slate-500 text-[11px]">support@mpss.com</p>
            </div>
          </div>

          {/* Col 4 & 5: GUARANTEE BADGES (Matching Screenshot) */}
          <div className="col-span-2 space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h5 className="text-slate-900 uppercase text-xs">100% ORIGINAL</h5>
                <p className="text-slate-500 text-[11px]">guarantee for all products at mpss.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t pt-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 shrink-0" />
              <div>
                <h5 className="text-slate-900 uppercase text-xs">Return within 14days</h5>
                <p className="text-slate-500 text-[11px]">of receiving your order</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO POPULAR SEARCHES TEXT BLOCK (Matching Screenshot) */}
        <div className="border-t border-slate-200 pt-8 space-y-3 text-[11px] text-slate-500 leading-relaxed">
          <h4 className="text-slate-800 text-xs uppercase">POPULAR SEARCHES</h4>
          <p>
            Sportswear | Athletic Sets | Baseball Caps | Round Neck T-Shirts | Polo T-Shirts | Cotton Normal T-Shirts | Hoodies | Custom Logo Prints | Custom Merchandise | Team Apparel | Gym Wear | Running Clothes | Oversized Tees
          </p>

          <p className="pt-2 text-slate-400 border-t border-slate-200">
            In case of any concern, <a href="/contact" className="text-emerald-700 underline">Contact Us</a>.
            © {currentYear} www.mpss.com. All rights reserved.
          </p>
        </div>
      </div>

      {/* Floating Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 text-emerald-400" />
      </button>
    </footer>
  );
}
