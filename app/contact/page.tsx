/**
 * Contact Page
 * Incorporates warm cream hero header, contact form, and company location/inquiry info
 */
import React from "react";
import ContactForm from "@/components/sections/contact-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F]">
      {/* Hero header */}
      <div className="bg-[#F3E6D3] border-b border-[#E8DAC8] py-16 sm:py-20 text-center relative overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#EFE2CF] blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow-label mb-3">GET IN TOUCH</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1F1F1F] mb-4">
            Connect With Our <span className="text-[#C8452A]">Apparel &amp; QA Team</span>
          </h1>
          <p className="text-base sm:text-lg text-[#4A4540] max-w-2xl mx-auto leading-relaxed">
            Have a bulk garment manufacturing order or require on-site quality inspection in South India? We are here to partner with your brand.
          </p>
        </div>
      </div>

      {/* Main Form Section */}
      <ContactForm />
    </div>
  );
}
