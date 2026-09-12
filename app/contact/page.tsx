/**
 * Contact Page
 * Incorporates hero header, contact form, and company location/inquiry info
 */
import React from "react";
import ContactForm from "@/components/sections/contact-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-slate-900 text-white py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-4">Contact Us</h1>
          <p className="text-base sm:text-lg text-slate-300 font-light max-w-2xl mx-auto">
            Get in touch with our apparel sourcing and quality inspection experts. We are here to bring your custom orders to life.
          </p>
        </div>
      </div>

      {/* Main Form Section */}
      <ContactForm />
    </div>
  );
}
