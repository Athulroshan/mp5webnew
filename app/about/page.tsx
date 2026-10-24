"use client";

/**
 * About page — Company overview, services intro, inspection detail
 * Styled with Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 */
import React from "react";
import Link from "next/link";
import { Shirt, ClipboardCheck, Shield, Eye, Award, Users, CheckCircle, Globe, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Data ─────────────────────────────────────────────────

const values = [
  { icon: Shield, title: "Quality First", description: "Every garment passes through rigorous quality checks at multiple stages of production." },
  { icon: Eye, title: "Transparency", description: "Full visibility into the manufacturing process with regular updates and reporting." },
  { icon: Award, title: "Excellence", description: "Committed to exceeding client expectations through continuous improvement." },
  { icon: Users, title: "Partnership", description: "We treat every client relationship as a long-term partnership built on trust." },
];

const inspectionServices = [
  "Pre-production material inspection",
  "In-line production inspection",
  "Final random inspection (AQL 2.5)",
  "Packaging and labeling verification",
  "Color fastness and shrinkage testing",
  "Container loading supervision",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F]">
      {/* ── Hero Section ── */}
      <section className="relative py-16 sm:py-24 bg-[#F3E6D3] border-b border-[#E8DAC8] overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EFE2CF] blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="eyebrow-label mb-3">ABOUT MPSS INDIA</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F1F1F] mb-6">
            Apparel Sourcing &amp; <span className="text-[#C8452A]">Inspection Excellence</span>
          </h1>
          <p className="text-base sm:text-lg text-[#4A4540] max-w-2xl mx-auto leading-relaxed">
            My Profile Sourcing Solutions (MPSS) — your trusted partner in custom garment manufacturing and on-site AQL quality inspection based in Tirupur, South India.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-20">
        {/* Mission Statement */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow-label mb-2">OUR PURPOSE</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F] mb-6">
            Bridging Vision &amp; <span className="text-[#C8452A]">Manufactured Reality</span>
          </h2>
          <p className="text-[#4A4540] text-base sm:text-lg leading-relaxed">
            To empower brands and businesses worldwide with premium custom apparel solutions and uncompromising quality inspection services. We ensure every stitch, seam, and fabric roll fulfills international quality benchmarks.
          </p>
        </div>

        {/* Service Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[24px] bg-white border border-[#E8DAC8] p-8 hover:border-[#C8452A] transition-all duration-300">
            <CardContent className="p-0">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F7ECE9] text-[#C8452A] flex items-center justify-center">
                  <Shirt className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F]">Custom Apparel Manufacturing</h3>
                  <span className="text-xs text-[#7A746E]">Concept to export delivery</span>
                </div>
              </div>
              <p className="text-[#4A4540] text-sm leading-relaxed mb-6">
                From tech packs and 3D mockups to bulk production, we manufacture custom clothing that reflects your exact brand identity. Our skilled artisans and modern machinery in Tirupur guarantee strict compliance.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E6D3] text-[#1F1F1F]">T-Shirts</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E6D3] text-[#1F1F1F]">Polo Shirts</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E6D3] text-[#1F1F1F]">Hoodies</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E6D3] text-[#1F1F1F]">Sportswear</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E6D3] text-[#1F1F1F]">Headwear</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] bg-white border border-[#E8DAC8] p-8 hover:border-[#C8452A] transition-all duration-300">
            <CardContent className="p-0">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF3EB] text-[#4A5B38] flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F]">Quality Inspection Services</h3>
                  <span className="text-xs text-[#7A746E]">AQL 2.5 Verification &amp; Digitized Reports</span>
                </div>
              </div>
              <p className="text-[#4A4540] text-sm leading-relaxed mb-6">
                Our certified QA inspectors ensure your products meet international quality standards before leaving the factory. We provide comprehensive photo audits and 19-worksheet Master Excel reports.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF3EB] text-[#4A5B38]">AQL 2.5 Standard</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF3EB] text-[#4A5B38]">In-Line DPI</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF3EB] text-[#4A5B38]">Final PSI Audit</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF3EB] text-[#4A5B38]">Lab Testing</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Values */}
        <div>
          <div className="text-center mb-12">
            <p className="eyebrow-label mb-2">OUR CORE ETHOS</p>
            <h2 className="text-3xl font-extrabold text-[#1F1F1F]">
              Principles That <span className="text-[#C8452A]">Guide Our Craft</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="card-warm p-6 text-center hover:border-[#C8452A] transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#F7ECE9] text-[#C8452A] flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-[#1F1F1F] mb-2">{v.title}</h3>
                <p className="text-xs text-[#4A4540] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inspection Services Detail */}
        <div className="card-warm p-8 sm:p-12 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EFF3EB] text-[#4A5B38] mb-4 inline-block">
                On-Site Quality Assurance
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] mb-4">
                South India QA Hubs &amp; <span className="text-[#C8452A]">Coverage</span>
              </h2>
              <p className="text-[#4A4540] text-sm leading-relaxed mb-6">
                Our quality inspection team operates directly within Tirupur, Coimbatore, and Chennai textile belts. We provide end-to-end audits covering raw fabrics, dyeing, printing, stitching, and export loading.
              </p>
              <ul className="space-y-3">
                {inspectionServices.map((service, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#4A4540]">
                    <CheckCircle className="h-4 w-4 text-[#C8452A] shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F3E6D3] rounded-[24px] p-8 text-center border border-[#E8DAC8]">
              <Globe className="h-14 w-14 text-[#C8452A] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-2">Global Export Presence</h3>
              <p className="text-xs text-[#4A4540] leading-relaxed max-w-sm mx-auto">
                Supplying apparel and executing third-party QA audits for clients across North America, Europe, Australia, and the Middle East.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-[#E8DAC8]">
                  <p className="text-2xl font-black text-[#C8452A]">10+</p>
                  <p className="text-xs text-[#7A746E] font-medium">Years Experience</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#E8DAC8]">
                  <p className="text-2xl font-black text-[#4A5B38]">50K+</p>
                  <p className="text-xs text-[#7A746E] font-medium">Inspections Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
