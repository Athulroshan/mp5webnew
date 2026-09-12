/**
 * Services page — Custom Apparel & Quality Inspection services
 * Includes service cards, process timeline, FAQ, and inquiry modal
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shirt, ClipboardCheck, ChevronDown, ChevronUp, Search, Shield, FileCheck, CheckCircle, Send, Users, Award, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CommonContactForm from "@/components/sections/contact-form";




// ─── Data ─────────────────────────────────────────────────

const services = [
  {
    id: "custom-apparel",
    title: "Custom Apparel Manufacturing",
    tagline: "From concept to creation",
    description: "End-to-end custom apparel manufacturing with premium materials, precision cutting, and expert craftsmanship. We bring your designs to life with attention to every detail.",
    icon: Shirt,
    color: "from-blue-500 to-indigo-600",
    features: [
      "Custom fabric selection from 500+ materials",
      "Digital pattern making and grading",
      "Sample development in 5-7 business days",
      "Bulk production with strict quality control",
      "Custom labeling and packaging",
      "MOQ as low as 50 pieces",
    ],
    benefits: ["Competitive pricing", "Quick turnaround", "Premium quality", "Flexible MOQ"],
    industries: ["Fashion brands", "Corporate wear", "Sports teams", "Schools & uniforms", "Event merchandise"],
  },
  {
    id: "quality-inspection",
    title: "Quality Inspection Services",
    tagline: "Trust through verification",
    description: "Comprehensive quality inspection and assurance services to ensure your products meet the highest standards before shipping. We inspect at every stage of production.",
    icon: ClipboardCheck,
    color: "from-emerald-500 to-teal-600",
    features: [
      "Pre-production inspection (PPI)",
      "During production inspection (DPI)",
      "Pre-shipment inspection (PSI)",
      "Container loading supervision",
      "Laboratory testing coordination",
      "Defect classification (AQL 2.5)",
    ],
    benefits: ["Reduce returns", "Ensure compliance", "Protect your brand", "Save costs"],
    industries: ["Garment exporters", "Retail chains", "E-commerce brands", "Wholesale distributors"],
  },
  {
    id: "inspection-system",
    title: "QA Digitization System (Google Form → Master Excel)",
    tagline: "Digitized inspection workflows",
    description: "Mobile QA data entry system mapping all 22 checklist items, measurements, photos, and defects directly into company 19-sheet Master Excel report templates.",
    icon: FileCheck,
    color: "from-blue-600 to-indigo-600",
    href: "/services/inspection-system",
    features: [
      "Google-Form-style mobile-first step-by-step UI",
      "Populates 19 Master Excel report worksheets",
      "Embedded camera photos inside Excel cell grids",
      "All 22 standard QA checklist items with conditional logic",
      "Instant downloadable .xlsx report files",
      "Autosave drafts and database historical records",
    ],
    benefits: ["Instant Excel report generation", "Zero manual Excel formatting", "Embedded photos", "100% template preservation"],
    industries: ["QA Inspectors", "Sourcing Agents", "Garment Factories", "Merchandisers"],
  },
];

const inspectionSteps = [
  { icon: Search, title: "Initial Assessment", description: "Understanding your quality requirements and applicable standards." },
  { icon: Shield, title: "On-Site Inspection", description: "Detailed inspection at the manufacturing facility." },
  { icon: FileCheck, title: "Reporting", description: "Comprehensive inspection reports with photos and defect analysis." },
  { icon: CheckCircle, title: "Certification", description: "Quality clearance certificate for approved shipments." },
];

const faqs = [
  { q: "What is the minimum order quantity (MOQ)?", a: "Our standard MOQ is 50 pieces per style per color. For repeat orders, we can accommodate smaller quantities." },
  { q: "How long does production take?", a: "Sample development takes 5-7 business days. Bulk production typically takes 3-4 weeks depending on order size and complexity." },
  { q: "What types of fabric do you work with?", a: "We work with a wide range — cotton, polyester, blends, denim, linen, silk, technical fabrics, and more. Custom fabric sourcing is also available." },
  { q: "Do you provide inspection for non-apparel products?", a: "While our expertise is in apparel, we can coordinate inspections for textile-related products such as home textiles, bags, and accessories." },
];

const stats = [
  { icon: Users, value: "500+", label: "Clients Served" },
  { icon: Award, value: "10+", label: "Years Experience" },
  { icon: Globe, value: "20+", label: "Countries" },
  { icon: CheckCircle, value: "99%", label: "Client Satisfaction" },
];

// ─── Component ────────────────────────────────────────────

export default function ServicesPage() {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", message: "" });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Inquiry submitted:", inquiryForm);
    setInquiryForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-4">Our Services</h1>
          <p className="text-lg text-indigo-100 font-light max-w-2xl mx-auto">
            Comprehensive apparel manufacturing and quality inspection services tailored to your needs
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
                <p className="text-2xl text-gray-900 font-light">{stat.value}</p>
                <p className="text-sm text-gray-500 font-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
                activeService === service.id ? "ring-2 ring-indigo-600" : ""
              }`}
              onClick={() => setActiveService(activeService === service.id ? null : service.id)}
            >
              <div className={`h-2 bg-gradient-to-r ${service.color}`} />
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${service.color} text-white`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-light text-gray-900 mb-1">{service.title}</h2>
                    <p className="text-sm text-gray-500 font-light">{service.tagline}</p>
                  </div>
                </div>

                <p className="text-gray-600 font-light mb-4 leading-relaxed">{service.description}</p>

                {/* Benefits badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.benefits.map((b, i) => (
                    <Badge key={i} variant="secondary" className="font-light text-xs">{b}</Badge>
                  ))}
                </div>

                {/* Expanded details */}
                {activeService === service.id && (
                  <div className="mt-6 pt-6 border-t space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <h3 className="text-sm text-gray-500 font-light uppercase tracking-wider mb-3">Key Features</h3>
                      <ul className="space-y-2">
                        {service.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-light">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500 font-light uppercase tracking-wider mb-3">Industries We Serve</h3>
                      <div className="flex flex-wrap gap-2">
                        {service.industries.map((ind, i) => (
                          <Badge key={i} variant="outline" className="font-light text-xs">{ind}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button variant="ghost" className="mt-4 font-light text-sm text-indigo-600">
                  {activeService === service.id ? "Show less" : "Learn more"}
                  {activeService === service.id ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Inspection Process Teaser Banner (Links to sub-page) ── */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-800/60">
            <div className="max-w-xl text-center md:text-left">
              <Badge className="mb-3 bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-semibold px-3 py-1">
                Service Sub-Page
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Inspection Process
              </h2>
              <p className="text-sm text-emerald-100/90 font-normal leading-relaxed">
                Ensuring quality at every stage. Explore our visual story showcasing Initial Assessment, On-Site Factory Inspection, Excel Reporting, and Certification.
              </p>
            </div>
            <Link href="/services/inspection-process" className="shrink-0">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-7 py-6 rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                Explore Inspection Process <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-light text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-light text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 font-light">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── UNIFIED COMMON CONTACT SECTION ── */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <CommonContactForm defaultScope="services" />
        </div>
      </div>
    </div>
  );
}
