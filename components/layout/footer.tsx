"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, ShieldCheck, RefreshCw, Award, Mail, Phone, MapPin } from "lucide-react";
import MLogo from "@/components/ui/m-logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#F3E6D3] text-[#4A4540] border-t border-[#E8DAC8] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Brand Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#E8DAC8]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl border border-[#E8DAC8] bg-[#FBF3E8] p-1 flex items-center justify-center group-hover:border-[#C8452A] transition-colors shadow-xs">
              <MLogo size={32} strokeColor="#1F1F1F" className="group-hover:stroke-[#C8452A] transition-colors" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#1F1F1F]">
                MPSS
              </span>
              <p className="text-[10px] text-[#7A746E] font-semibold uppercase tracking-wider">
                Custom Apparel &amp; Quality Inspection Services
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-semibold text-[#7A746E]">
            <a
              href="https://maps.google.com/?q=Eden+Garden+Vijayapuram+Tirupur+Tamil+Nadu+641606"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#C8452A] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C8452A]" /> Eden Garden, Tirupur
            </a>
            <span>•</span>
            <a
              href="mailto:mpssrpg@gmail.com"
              className="flex items-center gap-1.5 hover:text-[#C8452A] transition-colors"
              title="Open email in Gmail or mail app"
            >
              <Mail className="w-3.5 h-3.5 text-[#C8452A]" /> mpssrpg@gmail.com
            </a>
            <span>•</span>
            <a
              href="https://wa.me/918921647436?text=Hello%20MPSS%2C%20I%20would%20like%20to%20inquire%20about%20your%20apparel%20and%20quality%20inspection%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#4A5B38] font-bold text-[#1F1F1F] transition-colors"
              title="Chat on WhatsApp"
            >
              <Phone className="w-3.5 h-3.5 text-[#4A5B38]" /> +91 8921647436
            </a>
          </div>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Col 1: APPAREL PRODUCTS */}
          <div className="space-y-3">
            <h4 className="text-[#1F1F1F] font-bold uppercase tracking-wider text-xs">APPAREL PRODUCTS</h4>
            <ul className="space-y-2 text-[#4A4540] font-medium">
              <li><Link href="/products?category=Sportswear" className="hover:text-[#C8452A] transition-colors">Sportswear</Link></li>
              <li><Link href="/products?category=Caps" className="hover:text-[#C8452A] transition-colors">Caps &amp; Headwear</Link></li>
              <li><Link href="/products?category=Round+Neck+T-Shirts" className="hover:text-[#C8452A] transition-colors">Round Neck T-Shirts</Link></li>
              <li><Link href="/products?category=Polo+T-Shirts" className="hover:text-[#C8452A] transition-colors">Polo T-Shirts</Link></li>
              <li><Link href="/products?category=Normal+T-Shirts" className="hover:text-[#C8452A] transition-colors">Normal T-Shirts</Link></li>
              <li><Link href="/products?category=Hoodies" className="hover:text-[#C8452A] transition-colors">Hoodies &amp; Jackets</Link></li>
              <li><Link href="/customization" className="hover:text-[#C8452A] transition-colors font-semibold text-[#C8452A]">3D Custom Studio</Link></li>
            </ul>
          </div>

          {/* Col 2: SERVICES & QA */}
          <div className="space-y-3">
            <h4 className="text-[#1F1F1F] font-bold uppercase tracking-wider text-xs">SERVICES &amp; QA</h4>
            <ul className="space-y-2 text-[#4A4540] font-medium">
              <li><Link href="/services" className="hover:text-[#C8452A] transition-colors">Services Overview</Link></li>
              <li><Link href="/services/inspection-process" className="hover:text-[#C8452A] transition-colors">Inspection Process</Link></li>
              <li><Link href="/inspections" className="hover:text-[#C8452A] transition-colors">QA Inspection System</Link></li>
              <li><Link href="/journal" className="hover:text-[#C8452A] transition-colors">Technical Journal</Link></li>
              <li><Link href="/about" className="hover:text-[#C8452A] transition-colors">About MPSS</Link></li>
            </ul>
          </div>

          {/* Col 3: DIRECT CONTACT */}
          <div className="space-y-3">
            <h4 className="text-[#1F1F1F] font-bold uppercase tracking-wider text-xs">DIRECT CONTACT</h4>
            <ul className="space-y-2 text-[#4A4540] font-medium">
              <li>
                <a
                  href="https://wa.me/918921647436?text=Hello%20MPSS%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#4A5B38] flex items-center gap-1.5 font-bold text-[#1F1F1F] transition-colors"
                  title="Open WhatsApp chat"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4A5B38] shrink-0" />
                  <span>+91 8921647436</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/9197090987121?text=Hello%20MPSS%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#4A5B38] flex items-center gap-1.5 text-xs text-[#7A746E] transition-colors"
                  title="Open secondary WhatsApp chat"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4A5B38] shrink-0" />
                  <span>97090987121 (Alt)</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:mpssrpg@gmail.com"
                  className="hover:text-[#C8452A] flex items-center gap-1.5 transition-colors"
                  title="Open email in Gmail or mail app"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C8452A] shrink-0" />
                  <span>mpssrpg@gmail.com</span>
                </a>
              </li>
              <li className="pt-1">
                <Link href="/contact" className="hover:text-[#C8452A] transition-colors font-semibold">
                  Inquiry Form →
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#C8452A] transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 & 5: TRUST GUARANTEE CARDS */}
          <div className="col-span-2 space-y-4 bg-white p-6 rounded-3xl border border-[#E8DAC8] shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#EFF3EB] text-[#4A5B38] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#4A5B38]" />
              </div>
              <div>
                <h5 className="text-[#1F1F1F] font-bold text-xs uppercase tracking-wide">100% AQL 2.5 VERIFIED</h5>
                <p className="text-[#7A746E] text-[11px] leading-relaxed mt-0.5">
                  Every batch of custom garments undergoes strict in-line and pre-shipment quality inspection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-[#E8DAC8] pt-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F7ECE9] text-[#C8452A] flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-[#C8452A]" />
              </div>
              <div>
                <h5 className="text-[#1F1F1F] font-bold text-xs uppercase tracking-wide">FACTORY-DIRECT INTEGRITY</h5>
                <p className="text-[#7A746E] text-[11px] leading-relaxed mt-0.5">
                  Direct partnership with certified knitting, dyeing, and stitching facilities in South India.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E8DAC8] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A746E]">
          <p>
            © {currentYear} MPSS Sourcing Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#C8452A]">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-[#C8452A]">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#C8452A]">Contact Support</Link>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Pill Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3.5 bg-[#C8452A] hover:bg-[#B03820] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-40 active:scale-95"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </button>
    </footer>
  );
}
