/**
 * Unified Common Contact & Inquiry Section
 * Shared contact component for both Products (Manufacturing) & Services (Quality Inspection)
 * Features dynamic inquiry scope selector, input fields, contact details sidebar, and API posting.
 */
"use client";

import React, { useState } from "react";
import { Send, CheckCircle, AlertCircle, Mail, Phone, MapPin, Clock, ShieldCheck, Factory, Sparkles, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CommonContactFormProps {
  defaultScope?: "products" | "services";
  title?: string;
  subtitle?: string;
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email Inquiry",
    info: "info@myprofilesourcing.com",
    subtitle: "We respond within 24 business hours",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    icon: Phone,
    title: "Phone & WhatsApp",
    info: "+91 8921647436",
    subtitle: "Mon - Sat: 9:00 AM - 6:30 PM IST",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    icon: MapPin,
    title: "Factory & Sourcing Office",
    info: "Eden Garden, Vijayapuram",
    subtitle: "Tirupur, Tamil Nadu 641606, India",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];

export default function CommonContactForm({
  defaultScope = "products",
  title = "Start Your Project or Request an Inspection",
  subtitle = "Have a garment manufacturing order or quality inspection requirement? Contact our team in Tirupur, India.",
}: CommonContactFormProps) {
  const [scope, setScope] = useState<"products" | "services">(defaultScope);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    inquiryType: defaultScope === "services" ? "AQL Quality Inspection" : "Bulk Garment Production",
    quantity: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScopeChange = (newScope: "products" | "services") => {
    setScope(newScope);
    setFormData((prev) => ({
      ...prev,
      inquiryType: newScope === "services" ? "AQL Quality Inspection" : "Bulk Garment Production",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scopeCategory: scope === "products" ? "Product & Manufacturing" : "Service & QA Inspection",
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          contact: "",
          inquiryType: scope === "services" ? "AQL Quality Inspection" : "Bulk Garment Production",
          quantity: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50/80 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-3 bg-violet-100 text-violet-800 border-violet-200 text-xs font-bold px-3.5 py-1">
            Common Contact &amp; Inquiry Hub
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            {subtitle}
          </p>

          {/* Scope Selector Tabs */}
          <div className="mt-8 inline-flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-md">
            <button
              type="button"
              onClick={() => handleScopeChange("products")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                scope === "products"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Factory className="h-4 w-4" />
              <span>Products &amp; Manufacturing Inquiry</span>
            </button>
            <button
              type="button"
              onClick={() => handleScopeChange("services")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                scope === "services"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Services &amp; QA Inspection Request</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {scope === "products"
                  ? "Manufacturing & Product Inquiry Form"
                  : "Quality Inspection Request Form"}
              </h3>
              <Badge
                className={
                  scope === "products"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-emerald-100 text-emerald-800"
                }
              >
                {scope === "products" ? "Product Section" : "Service Section"}
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full name or company representative"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-xl border-slate-200 focus:ring-violet-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Business Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="rounded-xl border-slate-200 focus:ring-violet-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Phone / WhatsApp
                  </label>
                  <Input
                    id="contact"
                    name="contact"
                    type="tel"
                    placeholder="+91 00000 00000"
                    value={formData.contact}
                    onChange={handleChange}
                    className="rounded-xl border-slate-200 focus:ring-violet-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Inquiry Type *
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {scope === "products" ? (
                      <>
                        <option value="Bulk Garment Production">Bulk Garment Production</option>
                        <option value="Fabric & Yarn Sourcing">Fabric &amp; Yarn Sourcing</option>
                        <option value="Custom Tech Pack & Sampling">Custom Tech Pack &amp; Sampling</option>
                        <option value="Private Label Apparel">Private Label Apparel</option>
                      </>
                    ) : (
                      <>
                        <option value="AQL Quality Inspection">AQL Quality Inspection (Pre-Shipment)</option>
                        <option value="In-Line Sewing Audit">In-Line Sewing Audit</option>
                        <option value="Fabric 4-Point System Audit">Fabric 4-Point System Audit</option>
                        <option value="Container Loading Supervision">Container Loading Supervision</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  {scope === "products" ? "Estimated Order Quantity (Pieces)" : "Lot Size (Units / Cartons)"}
                </label>
                <Input
                  id="quantity"
                  name="quantity"
                  placeholder="e.g. 500 pcs or 10,000 units lot"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="rounded-xl border-slate-200 focus:ring-violet-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Project Details / Inspection Requirements *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={
                    scope === "products"
                      ? "Specify style requirements, fabric composition, GSM, target delivery date, or tech pack link..."
                      : "Specify factory location, inspection date, target AQL level (2.5/4.0), or special defect criteria..."
                  }
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="rounded-xl border-slate-200 focus:ring-violet-500 text-sm"
                />
              </div>

              {/* Submission Feedback Messages */}
              {submitStatus === "success" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Inquiry Received Successfully!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Our sourcing &amp; QA team in Tirupur will review your request and contact you within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-900">Submission Failed</p>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Please check your connection and try again, or reach us directly at info@myprofilesourcing.com.
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 font-bold text-xs rounded-xl shadow-md transition-all ${
                  scope === "products"
                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Submitting Request...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {scope === "products" ? "Submit Manufacturing Inquiry" : "Submit Inspection Request"}
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Details & Office Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">MPSS Sourcing Solutions</h3>
                  <p className="text-xs text-slate-400 font-semibold">Tirupur Garment Hub, Tamil Nadu, India</p>
                </div>
              </div>

              <div className="space-y-5">
                {contactInfo.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-sm font-bold text-white">{item.info}</p>
                      <p className="text-xs text-slate-400 font-normal">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Guarantee Box */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 mb-1">
                  Guaranteed 24-Hour Response
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed font-normal">
                  Our garment technical merchandisers and QA engineers respond to all Product and Service inquiries within 24 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const ContactForm = CommonContactForm;

