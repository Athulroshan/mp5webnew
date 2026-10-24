/**
 * Services page — Custom Apparel & Quality Inspection services
 * Includes service cards, process timeline, FAQ, and inquiry modal
 * Styled in Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shirt,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Shield,
  FileCheck,
  CheckCircle,
  Send,
  Users,
  Award,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CommonContactForm from "@/components/sections/contact-form";

// ─── Data ─────────────────────────────────────────────────

const services = [
  {
    id: "custom-apparel",
    title: "Custom Apparel Manufacturing",
    tagline: "From concept to bulk export",
    description:
      "End-to-end custom apparel manufacturing with premium materials, precision cutting, and expert craftsmanship in Tirupur, India. We bring your tech packs to life with zero compromise.",
    icon: Shirt,
    accentBg: "bg-[#F7ECE9]",
    accentColor: "text-[#C8452A]",
    features: [
      "Custom fabric selection from 500+ knit and woven textiles",
      "Digital pattern making, grading, and complete tech packs",
      "Physical sample development delivered in 5 to 7 business days",
      "Bulk production with strict in-line quality controls",
      "Custom woven labels, tags, and barcode packaging",
      "Flexible MOQs starting as low as 50 pieces per style",
    ],
    benefits: ["Competitive pricing", "Quick turnaround", "Premium quality", "Flexible MOQ"],
    industries: ["Fashion brands", "Corporate wear", "Sports teams", "Schools & uniforms", "Event merchandise"],
  },
  {
    id: "quality-inspection",
    title: "Quality Inspection Services",
    tagline: "Trust through rigorous verification",
    description:
      "Comprehensive on-site quality inspection and audit services ensuring your garments meet international standards before dispatch. We inspect raw textiles, inline sewing, and final carton packing.",
    icon: ClipboardCheck,
    accentBg: "bg-[#EFF3EB]",
    accentColor: "text-[#4A5B38]",
    features: [
      "Pre-production inspection (PPI) & fabric testing",
      "During production inspection (DPI) & inline audits",
      "Pre-shipment inspection (PSI) based on ANSI/ASQ AQL 2.5",
      "Container loading supervision (CLS) & carton seal audits",
      "Laboratory testing coordination (GSM, shrinkage, colorfastness)",
      "Instant photographic defect classification and reporting",
    ],
    benefits: ["Reduce returns", "Ensure compliance", "Protect your brand", "Save costs"],
    industries: ["Garment exporters", "Retail chains", "E-commerce brands", "Wholesale distributors"],
  },
  {
    id: "inspection-system",
    title: "QA Digitization System (Mobile Form → Master Excel)",
    tagline: "Digitized inspection workflows",
    description:
      "Field-tested QA data entry platform mapping all 22 checklist items, measurements, photos, and defect tallies directly into company 19-sheet Master Excel report templates.",
    icon: FileCheck,
    accentBg: "bg-[#FDF6E9]",
    accentColor: "text-[#C68B2C]",
    href: "/inspections",
    features: [
      "Mobile-first step-by-step UI for on-site factory auditors",
      "Direct population of 19 company Master Excel worksheets",
      "Embedded camera photos formatted directly into Excel cell grids",
      "All 22 standard garment QA checklist categories",
      "Instant downloadable .xlsx report files & PDF export",
      "Autosave offline drafts with centralized database synchronization",
    ],
    benefits: ["Instant Excel report generation", "Zero manual Excel formatting", "Embedded photos", "100% template preservation"],
    industries: ["QA Inspectors", "Sourcing Agents", "Garment Factories", "Merchandisers"],
  },
];

const stats = [
  { icon: Users, value: "500+", label: "Clients Served" },
  { icon: Award, value: "10+", label: "Years Experience" },
  { icon: Globe, value: "20+", label: "Countries Reached" },
  { icon: CheckCircle, value: "99%", label: "Inspection Accuracy" },
];

const faqs = [
  {
    q: "What is the minimum order quantity (MOQ)?",
    a: "Our standard manufacturing MOQ is 50 pieces per style per color. For repeat orders or custom development programs, we can accommodate flexible tier quantities.",
  },
  {
    q: "How long does production take?",
    a: "Sample prototyping takes 5–7 business days. Bulk garment production typically takes 3–4 weeks depending on order size, fabric availability, and complexity.",
  },
  {
    q: "What types of fabric do you work with?",
    a: "We work with combed cotton, organic cotton, dry-fit polyester, poly-cotton blends, fleece, French terry, pique knit, linen, and custom blends sourced from certified South India mills.",
  },
  {
    q: "Do you provide inspection for non-apparel products?",
    a: "While our core expertise is in apparel and fashion accessories, we coordinate quality audits for home textiles, caps, canvas bags, and related textile merchandise.",
  },
];

export default function ServicesPage() {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F]">
      {/* ── Hero Banner ── */}
      <section className="relative py-16 sm:py-24 bg-[#F3E6D3] border-b border-[#E8DAC8] overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#EFE2CF] blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow-label mb-3">SOURCING &amp; QUALITY ASSURANCE</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F1F1F] mb-6">
            Apparel Manufacturing &amp; <span className="text-[#C8452A]">Inspection Services</span>
          </h1>
          <p className="text-base sm:text-lg text-[#4A4540] max-w-2xl mx-auto leading-relaxed">
            From technical design and certified factory production to on-site AQL 2.5 quality clearance in Tirupur, India.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="bg-[#FBF3E8] border-b border-[#E8DAC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-6 w-6 mx-auto text-[#C8452A] mb-2" />
                <p className="text-3xl text-[#1F1F1F] font-black">{stat.value}</p>
                <p className="text-xs text-[#7A746E] font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ── Service Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`rounded-[24px] bg-white border border-[#E8DAC8] p-7 transition-all duration-300 hover:border-[#C8452A] shadow-xs flex flex-col justify-between cursor-pointer ${
                activeService === service.id ? "ring-2 ring-[#C8452A]" : ""
              }`}
              onClick={() => setActiveService(activeService === service.id ? null : service.id)}
            >
              <div>
                <div className="flex items-start gap-4 mb-5">
                  <div className={`p-3 rounded-2xl ${service.accentBg} ${service.accentColor} shrink-0`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1F1F1F] leading-snug">{service.title}</h2>
                    <p className="text-xs text-[#7A746E] font-medium">{service.tagline}</p>
                  </div>
                </div>

                <p className="text-sm text-[#4A4540] mb-5 leading-relaxed">{service.description}</p>

                {/* Benefits Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.benefits.map((b, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3E6D3] text-[#1F1F1F]"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                {/* Expanded Details */}
                {activeService === service.id && (
                  <div className="mt-6 pt-5 border-t border-[#E8DAC8] space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <h3 className="eyebrow-label mb-2">Key Features</h3>
                      <ul className="space-y-2">
                        {service.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#4A4540]">
                            <CheckCircle className="h-4 w-4 text-[#4A5B38] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="eyebrow-label mb-2">Industries Served</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {service.industries.map((ind, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF3EB] text-[#4A5B38]"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#E8DAC8]/60 flex items-center justify-between">
                <button
                  type="button"
                  className="text-xs font-bold text-[#C8452A] hover:underline flex items-center gap-1"
                >
                  <span>{activeService === service.id ? "Show Less" : "View Specifications"}</span>
                  {activeService === service.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {service.href && (
                  <Link
                    href={service.href}
                    className="text-xs font-bold text-[#1F1F1F] hover:text-[#C8452A] flex items-center gap-1"
                  >
                    <span>Launch</span> <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* ── 4-Stage Methodical Execution Workflow (Relocated from landing page) ── */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow-label mb-2">METHODICAL EXECUTION</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1F1F1F]">
              How We <span className="text-[#C8452A]">Deliver Excellence</span>
            </h2>
            <p className="text-[#4A4540] mt-3 text-sm">
              From your initial tech pack and fabric sourcing to final container sealing, every phase is tracked and verified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: "01",
                title: "Concept & Tech Pack",
                desc: "We analyze garment specs, grading charts, tolerance levels, and material targets.",
                tag: "Consultation",
              },
              {
                number: "02",
                title: "Sourcing & Sampling",
                desc: "Lab dips, fabric sourcing from 500+ textiles, and precision prototype samples in 5–7 days.",
                tag: "Development",
              },
              {
                number: "03",
                title: "In-Line Inspection",
                desc: "On-site QA team monitors cutting, stitching, shrinkage, and seam integrity at every milestone.",
                tag: "Production",
              },
              {
                number: "04",
                title: "Final AQL 2.5 & Packing",
                desc: "100% pre-shipment audit, barcode verification, carton packaging, and digitized Excel reports.",
                tag: "Delivery",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[24px] border border-[#E8DAC8] shadow-xs hover:border-[#C8452A] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-[#C8452A]">{step.number}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F3E6D3] text-[#1F1F1F]">
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1F1F1F] mb-1.5 group-hover:text-[#C8452A] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-[#4A4540] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Inspection Process Teaser Banner ── */}
        <div className="mb-20">
          <div className="bg-[#1F1F1F] rounded-[28px] p-8 sm:p-12 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 border border-[#3A332D]">
            <div className="max-w-xl text-center md:text-left">
              <span className="eyebrow-label text-[#A89F97] mb-2 block">
                INSPECTION WORKFLOW
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Factory Inspection <span className="text-[#C8452A]">Process</span>
              </h2>
              <p className="text-sm text-[#A89F97] font-normal leading-relaxed">
                Learn how our certified inspectors execute raw fabric audits, sewing defect tallies, measurement charts, and final carton seals with instant Excel outputs.
              </p>
            </div>
            <Link
              href="/services/inspection-process"
              className="btn-pill-primary shrink-0 py-3.5 px-8"
            >
              Explore Inspection Process <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* ── FAQs Section ── */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <p className="eyebrow-label mb-2">COMMON INQUIRIES</p>
            <h2 className="text-3xl font-extrabold text-[#1F1F1F]">
              Frequently Asked <span className="text-[#C8452A]">Questions</span>
            </h2>
          </div>
          <div className="space-y-3.5">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-[#E8DAC8] overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-[#1F1F1F] hover:text-[#C8452A] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-[#C8452A] shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 text-[#7A746E] shrink-0 ml-2" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-[#4A4540] leading-relaxed border-t border-[#E8DAC8]/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Unified Common Contact Section ── */}
        <div className="mt-16 pt-8 border-t border-[#E8DAC8]">
          <CommonContactForm defaultScope="services" />
        </div>
      </div>
    </div>
  );
}
