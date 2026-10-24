/**
 * Unified Common Contact & Inquiry Section
 * Shared contact component for both Products (Manufacturing) & Services (Quality Inspection)
 * Features dynamic inquiry scope selector, input fields, contact details sidebar, and API posting.
 * Styled in Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 */
"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle, AlertCircle, Mail, Phone, MapPin, Clock, ShieldCheck, Factory, Sparkles, Building2, X } from "lucide-react";
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
    info: "mpssrpg@gmail.com",
    subtitle: "Click to open in Gmail / Email app",
    href: "mailto:mpssrpg@gmail.com",
    badge: "Send Email",
    color: "text-[#C8452A]",
    bgColor: "bg-[#F7ECE9]",
  },
  {
    icon: Phone,
    title: "Phone & WhatsApp (Primary)",
    info: "+91 8921647436",
    subtitle: "Click to chat on WhatsApp • Mon - Sat 9:00 AM - 6:30 PM",
    href: "https://wa.me/918921647436?text=Hello%20MPSS%2C%20I%20would%20like%20to%20inquire%20about%20your%20apparel%20and%20quality%20inspection%20services.",
    badge: "WhatsApp",
    color: "text-[#4A5B38]",
    bgColor: "bg-[#EFF3EB]",
  },
  {
    icon: Phone,
    title: "Secondary Contact & WhatsApp",
    info: "+91 9790987121",
    subtitle: "Click to chat on WhatsApp • Alternate contact line",
    href: "https://wa.me/919790987121?text=Hello%20MPSS%2C%20I%20would%20like%20to%20inquire%20about%20your%20apparel%20and%20quality%20inspection%20services.",
    badge: "WhatsApp",
    color: "text-[#4A5B38]",
    bgColor: "bg-[#EFF3EB]",
  },
  {
    icon: MapPin,
    title: "Factory & Sourcing Office",
    info: "Eden Garden, Vijayapuram",
    subtitle: "Tirupur, Tamil Nadu 641606, India",
    href: "https://maps.google.com/?q=Eden+Garden+Vijayapuram+Tirupur+Tamil+Nadu+641606",
    badge: "Map",
    color: "text-[#C68B2C]",
    bgColor: "bg-[#FDF6E9]",
  },
];

export default function CommonContactForm({
  defaultScope = "products",
  title = "For Enquiry",
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSubmitStatus("idle");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSuccessModal) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSuccessModal]);

  const validateField = (name: string, value: string): string => {
    const trimmed = value.trim();
    if (name === "name") {
      if (!trimmed) return "Your Name is required.";
    }
    if (name === "email") {
      if (!trimmed) return "Business Email is required.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return "Please enter a valid business email address.";
    }
    if (name === "inquiryType") {
      if (!trimmed) return "Please select an Inquiry Type.";
    }
    if (name === "message") {
      if (!trimmed) return "Project Details / Requirements are required.";
      if (trimmed.length < 10) return "Please provide at least 10 characters describing your requirements.";
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleScopeChange = (newScope: "products" | "services") => {
    setScope(newScope);
    setFormData((prev) => ({
      ...prev,
      inquiryType: newScope === "services" ? "AQL Quality Inspection" : "Bulk Garment Production",
    }));
    setErrors({});
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateField("name", formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateField("email", formData.email);
    if (emailErr) newErrors.email = emailErr;

    const typeErr = validateField("inquiryType", formData.inquiryType);
    if (typeErr) newErrors.inquiryType = typeErr;

    const msgErr = validateField("message", formData.message);
    if (msgErr) newErrors.message = msgErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.contact.trim(),
          inquiryType: formData.inquiryType.trim(),
          quantity: formData.quantity.trim(),
          message: formData.message.trim(),
          scopeCategory: scope === "products" ? "Product & Manufacturing" : "Service & QA Inspection",
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSubmitStatus("idle");
        setShowSuccessModal(true);
        // Reset form data after confirmed backend success
        setFormData({
          name: "",
          email: "",
          contact: "",
          inquiryType: scope === "services" ? "AQL Quality Inspection" : "Bulk Garment Production",
          quantity: "",
          message: "",
        });
        setErrors({});
      } else {
        setSubmitStatus("error");
        setErrorMessage(json.message || "Failed to submit inquiry. Please try again.");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Network error occurred. Your entered details have been preserved. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: "",
      email: "",
      contact: "",
      inquiryType: scope === "services" ? "AQL Quality Inspection" : "Bulk Garment Production",
      quantity: "",
      message: "",
    });
    setErrors({});
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FBF3E8] border-t border-[#E8DAC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="eyebrow-label mb-2">DIRECT SOURCING &amp; QA DESK</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] tracking-tight mb-3">
            {title === "For Enquiry" ? (
              <>
                For <span className="text-[#C8452A]">Enquiry</span>
              </>
            ) : title.includes(" or ") ? (
              <>
                {title.split(" or ")[0]} or <span className="text-[#C8452A]">{title.split(" or ")[1]}</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="text-base text-[#4A4540] font-normal leading-relaxed">
            {subtitle}
          </p>

          {/* Scope Selector Pills */}
          <div className="mt-8 inline-flex p-1.5 bg-[#F3E6D3] rounded-full border border-[#E8DAC8] shadow-xs">
            <button
              type="button"
              onClick={() => handleScopeChange("products")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                scope === "products"
                  ? "bg-[#C8452A] text-white shadow-sm"
                  : "text-[#4A4540] hover:text-[#1F1F1F]"
              }`}
            >
              <Factory className="h-4 w-4" />
              <span>Products &amp; Manufacturing Inquiry</span>
            </button>
            <button
              type="button"
              onClick={() => handleScopeChange("services")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                scope === "services"
                  ? "bg-[#C8452A] text-white shadow-sm"
                  : "text-[#4A4540] hover:text-[#1F1F1F]"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Services &amp; QA Inspection Request</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-[24px] p-6 sm:p-10 border border-[#E8DAC8] shadow-sm">
            {/* Form Header with Subtitle and Badge */}
            <div className="border-b border-[#E8DAC8] pb-4 mb-6">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <h3 className="text-xl font-bold text-[#1F1F1F]">
                  {scope === "products"
                    ? "Manufacturing & Product Inquiry"
                    : "Quality Inspection Request"}
                </h3>
                <Badge
                  className={
                    scope === "products"
                      ? "bg-[#F7ECE9] text-[#C8452A] border border-[#C8452A]/20 rounded-full font-bold text-xs"
                      : "bg-[#EFF3EB] text-[#4A5B38] border border-[#4A5B38]/20 rounded-full font-bold text-xs"
                  }
                >
                  {scope === "products" ? "Apparel Production" : "QA Audit"}
                </Badge>
              </div>
              <p className="text-xs text-[#7A746E] font-normal leading-relaxed">
                {scope === "products"
                  ? "Tell us about your garment requirements. Our team will review your inquiry and get in touch."
                  : "Provide your factory and inspection schedule details. Our QA engineers will verify your AQL specs."}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Global Error Banner */}
                {submitStatus === "error" && (
                  <div className="bg-[#F7ECE9] border border-[#C8452A]/30 rounded-2xl p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-[#C8452A] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#C8452A]">Submission could not be completed</p>
                        <p className="text-xs text-[#4A4540] mt-0.5 leading-relaxed">
                          {errorMessage || "We were unable to save your inquiry. Your details have been preserved below. Please check your connection and retry, or reach us directly at"}{" "}
                          <a href="mailto:mpssrpg@gmail.com" className="font-bold underline text-[#C8452A]">
                            mpssrpg@gmail.com
                          </a>.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-xs font-bold text-[#C8452A] hover:underline shrink-0"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* First Row: Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="block text-xs font-bold text-[#1F1F1F] mb-1.5 uppercase tracking-wider"
                    >
                      Your Name *
                    </label>
                    <Input
                      id="inquiry-name"
                      name="name"
                      placeholder="Full name or company representative"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={`rounded-xl bg-[#FBF3E8]/50 text-sm transition-colors focus:ring-2 focus:ring-[#C8452A]/20 focus:outline-none ${
                        errors.name
                          ? "border-[#C8452A] focus:border-[#C8452A]"
                          : "border-[#E8DAC8] focus:border-[#C8452A]"
                      }`}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-xs text-[#C8452A] mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-email"
                      className="block text-xs font-bold text-[#1F1F1F] mb-1.5 uppercase tracking-wider"
                    >
                      Business Email *
                    </label>
                    <Input
                      id="inquiry-email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={`rounded-xl bg-[#FBF3E8]/50 text-sm transition-colors focus:ring-2 focus:ring-[#C8452A]/20 focus:outline-none ${
                        errors.email
                          ? "border-[#C8452A] focus:border-[#C8452A]"
                          : "border-[#E8DAC8] focus:border-[#C8452A]"
                      }`}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-[#C8452A] mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Second Row: Phone / WhatsApp and Inquiry Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="inquiry-contact"
                      className="block text-xs font-bold text-[#1F1F1F] mb-1.5 uppercase tracking-wider"
                    >
                      Phone / WhatsApp (Optional)
                    </label>
                    <Input
                      id="inquiry-contact"
                      name="contact"
                      type="tel"
                      placeholder="+91 00000 00000"
                      value={formData.contact}
                      onChange={handleChange}
                      className="rounded-xl border-[#E8DAC8] bg-[#FBF3E8]/50 focus:border-[#C8452A] focus:ring-2 focus:ring-[#C8452A]/20 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-type"
                      className="block text-xs font-bold text-[#1F1F1F] mb-1.5 uppercase tracking-wider"
                    >
                      Inquiry Type *
                    </label>
                    <select
                      id="inquiry-type"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.inquiryType}
                      aria-describedby={errors.inquiryType ? "type-error" : undefined}
                      className={`w-full h-10 px-3 rounded-xl border bg-[#FBF3E8]/50 text-sm font-medium text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#C8452A]/20 ${
                        errors.inquiryType
                          ? "border-[#C8452A] focus:border-[#C8452A]"
                          : "border-[#E8DAC8] focus:border-[#C8452A]"
                      }`}
                    >
                      {scope === "products" ? (
                        <>
                          <option value="Bulk Garment Production">Bulk Garment Production</option>
                          <option value="Private Label / OEM Manufacturing">Private Label / OEM Manufacturing</option>
                          <option value="Sample Development">Sample Development</option>
                          <option value="Custom Apparel">Custom Apparel</option>
                          <option value="Fabric Sourcing">Fabric Sourcing</option>
                          <option value="Other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="AQL Quality Inspection">AQL Quality Inspection (Pre-Shipment)</option>
                          <option value="In-Line Sewing Audit">In-Line Sewing Audit</option>
                          <option value="Fabric 4-Point System Audit">Fabric 4-Point System Audit</option>
                          <option value="Container Loading Supervision">Container Loading Supervision</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                    {errors.inquiryType && (
                      <p id="type-error" className="text-xs text-[#C8452A] mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.inquiryType}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Third Row: Estimated Order Quantity */}
                <div>
                  <label
                    htmlFor="inquiry-quantity"
                    className="block text-xs font-bold text-[#1F1F1F] mb-1.5 uppercase tracking-wider"
                  >
                    Estimated Order Quantity (Optional)
                  </label>
                  <Input
                    id="inquiry-quantity"
                    name="quantity"
                    placeholder="e.g. 500 pieces or 10,000 pieces"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="rounded-xl border-[#E8DAC8] bg-[#FBF3E8]/50 focus:border-[#C8452A] focus:ring-2 focus:ring-[#C8452A]/20 focus:outline-none text-sm"
                  />
                </div>

                {/* Fourth Row: Project Details / Requirements */}
                <div>
                  <label
                    htmlFor="inquiry-message"
                    className="block text-xs font-bold text-[#1F1F1F] mb-1.5 uppercase tracking-wider"
                  >
                    Project Details / Requirements *
                  </label>
                  <Textarea
                    id="inquiry-message"
                    name="message"
                    placeholder="Describe garment styles, fabric composition, GSM, sizes, target delivery date, or other requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`rounded-xl bg-[#FBF3E8]/50 text-sm transition-colors focus:ring-2 focus:ring-[#C8452A]/20 focus:outline-none ${
                      errors.message
                        ? "border-[#C8452A] focus:border-[#C8452A]"
                        : "border-[#E8DAC8] focus:border-[#C8452A]"
                    }`}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-xs text-[#C8452A] mt-1.5 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button & Privacy Note */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 font-bold text-xs rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-[#7A746E] mt-3 font-normal">
                    Your information will only be used to respond to your inquiry.
                  </p>
                </div>
              </form>
          </div>

          {/* Contact Details & Office Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1F1F1F] text-white rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6 border border-[#3A332D]">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C8452A]/20 border border-[#C8452A]/40 flex items-center justify-center text-[#C8452A]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">MPSS Sourcing Solutions</h3>
                  <p className="text-xs text-[#A89F97] font-semibold">Tirupur Garment Hub, Tamil Nadu, India</p>
                </div>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-3.5 p-3 -mx-3 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer border border-transparent hover:border-white/10"
                    title={`Click to open ${item.title}`}
                  >
                    <div className={`w-10 h-10 ${item.bgColor} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A89F97]">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90 group-hover:bg-[#C8452A] group-hover:text-white transition-colors">
                          {item.badge} ↗
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white group-hover:text-[#F3E6D3] transition-colors truncate">
                        {item.info}
                      </p>
                      <p className="text-xs text-[#A89F97] font-normal leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Response Guarantee Box */}
            <div className="bg-[#EFF3EB] rounded-[24px] p-6 border border-[#4A5B38]/20 shadow-xs flex items-start gap-4">
              <div className="p-3 bg-[#4A5B38] text-white rounded-2xl shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1F1F] mb-1">
                  Guaranteed 24-Hour Response
                </h4>
                <p className="text-xs text-[#4A5B38] leading-relaxed font-normal">
                  Our garment technical merchandisers and QA engineers review all requests promptly from Monday through Saturday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Popup */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-heading"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-[28px] border border-[#E8DAC8] p-7 sm:p-9 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Right Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close dialog"
              className="absolute top-5 right-5 p-2 rounded-full text-[#7A746E] hover:text-[#1F1F1F] hover:bg-[#FBF3E8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8452A]/30"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Green Check Circle Icon */}
            <div className="w-16 h-16 rounded-full bg-[#EFF3EB] text-[#4A5B38] border border-[#4A5B38]/30 mx-auto mb-5 flex items-center justify-center shadow-xs">
              <CheckCircle className="h-9 w-9 text-[#4A5B38]" />
            </div>

            {/* Heading & Main Message */}
            <div className="text-center mb-6">
              <h3
                id="success-modal-heading"
                className="text-2xl sm:text-[26px] font-extrabold text-[#1F1F1F] tracking-tight mb-3"
              >
                Thank You for Your Inquiry!
              </h3>
              <p className="text-sm text-[#4A4540] font-normal leading-relaxed">
                Your manufacturing requirements have been submitted successfully. Our team will review your inquiry and get in touch with you.
              </p>
            </div>

            {/* Confirmation Details Checklist */}
            <div className="bg-[#FBF3E8] rounded-2xl p-4 sm:p-5 border border-[#E8DAC8] space-y-3 mb-7 text-left">
              <div className="flex items-start gap-3">
                <span className="text-[#4A5B38] font-bold text-sm leading-none mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-[#1F1F1F] font-medium leading-relaxed">
                  Your inquiry has been received successfully.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4A5B38] font-bold text-sm leading-none mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-[#1F1F1F] font-medium leading-relaxed">
                  Our team will review your requirements.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#4A5B38] font-bold text-sm leading-none mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-[#1F1F1F] font-medium leading-relaxed">
                  We will contact you using the details you provided if further discussion is needed.
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-10 py-3 h-auto text-sm font-bold rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white shadow-sm transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-[#C8452A]/40"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export const ContactForm = CommonContactForm;
