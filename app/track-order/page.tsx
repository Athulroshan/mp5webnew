/**
 * Order Tracking & Live Delivery Status Page
 * Visual progress timeline showing: Order Placed -> Left Warehouse -> In Transit -> Out for Delivery -> Delivered
 * Styled in Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 */
"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  Home,
  Search,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TRACKING_STEPS = [
  { id: 1, label: "Order Placed", time: "Aug 03, 09:30 AM", location: "Online Portal", status: "completed", icon: Package },
  { id: 2, label: "Left Warehouse", time: "Aug 03, 02:45 PM", location: "MPSS Fulfillment Hub, Tirupur", status: "completed", icon: Building },
  { id: 3, label: "In Transit", time: "Aug 04, 08:15 AM", location: "Regional Express Logistics Hub", status: "active", icon: Truck },
  { id: 4, label: "Out for Delivery", time: "Expected Aug 05", location: "Local Courier Station", status: "pending", icon: MapPin },
  { id: 5, label: "Delivered", time: "Expected Aug 05", location: "Delivery Address", status: "pending", icon: Home },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "ORD-2026-9001";
  const [searchId, setSearchId] = useState(initialOrderId);
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setActiveOrderId(searchId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F] pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/products" className="text-xs text-[#7A746E] hover:text-[#C8452A] flex items-center gap-1 mb-2 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <p className="eyebrow-label mb-1">REAL-TIME LOGISTICS</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F]">
              Live Order &amp; <span className="text-[#C8452A]">Delivery Status</span>
            </h1>
            <p className="text-sm text-[#4A4540] mt-1">Real-time shipment location &amp; doorstep delivery tracking</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <Input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order # (e.g. ORD-2026-9001)"
              className="bg-white border-[#E8DAC8] text-sm rounded-full w-full sm:w-64 focus:ring-[#C8452A]"
            />
            <Button type="submit" className="btn-pill-primary shrink-0 py-2.5 px-6">
              <Search className="w-4 h-4 mr-1" /> Track
            </Button>
          </form>
        </div>

        {/* Tracking Main Card */}
        <Card className="border-[#E8DAC8] rounded-[28px] overflow-hidden shadow-xs bg-white">
          <CardHeader className="bg-[#1F1F1F] text-white p-6 sm:p-7 rounded-t-[27px]">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A89F97] font-medium">Order Reference:</span>
                  <span className="text-lg font-mono font-bold text-[#C8452A]">{activeOrderId}</span>
                </div>
                <p className="text-xs text-[#A89F97] mt-1">Carrier: Express Air Cargo • AWB: 889104928 • Tirupur Hub</p>
              </div>

              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EFF3EB] text-[#4A5B38] self-start sm:self-auto border border-[#4A5B38]/20">
                🚚 IN TRANSIT • Arriving Tomorrow
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-10">
            {/* Visual Step-by-Step Delivery Progress Timeline */}
            <div>
              <h3 className="eyebrow-label mb-6">Delivery Progress Timeline</h3>

              <div className="relative">
                {/* Desktop Line connecting steps */}
                <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-[#E8DAC8] z-0">
                  <div className="h-full bg-[#C8452A] w-[55%] transition-all duration-500 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                  {TRACKING_STEPS.map((step) => {
                    const StepIcon = step.icon;
                    const isCompleted = step.status === "completed";
                    const isActive = step.status === "active";

                    return (
                      <div key={step.id} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                            isCompleted
                              ? "bg-[#C8452A] text-white shadow-xs ring-4 ring-[#F7ECE9]"
                              : isActive
                              ? "bg-[#C68B2C] text-white ring-4 ring-[#FDF6E9] animate-pulse"
                              : "bg-[#F3E6D3] text-[#7A746E] border border-[#E8DAC8]"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
                        </div>

                        <div>
                          <p className={`text-sm font-bold ${isActive ? "text-[#C8452A]" : "text-[#1F1F1F]"}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-[#7A746E] mt-0.5">{step.time}</p>
                          <p className="text-[11px] text-[#4A5B38] font-semibold mt-0.5">{step.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Shipment Status Details */}
            <div className="bg-[#EFF3EB] border border-[#4A5B38]/20 rounded-[20px] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4A5B38] text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm text-[#1F1F1F] font-bold">Package is currently in transit</h4>
                  <p className="text-xs text-[#4A5B38] mt-0.5">Departed regional sorting facility. On schedule for doorstep delivery.</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-white rounded-full text-[#4A5B38] border border-[#4A5B38]/30 shrink-0">
                Updated 15 mins ago
              </span>
            </div>

            {/* Package Details */}
            <div className="border-t border-[#E8DAC8] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="eyebrow-label mb-2">Shipping Address</h4>
                <p className="text-[#1F1F1F] font-bold">Rahul Sharma</p>
                <p className="text-[#4A4540]">123 MG Road, Indiranagar</p>
                <p className="text-[#4A4540]">Bengaluru, Karnataka - 560001</p>
                <p className="text-[#7A746E] text-xs mt-1">Phone: +91 9123456789</p>
              </div>

              <div>
                <h4 className="eyebrow-label mb-2">Order Contents</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#FBF3E8] p-3 rounded-2xl border border-[#E8DAC8]">
                    <div>
                      <p className="text-[#1F1F1F] text-xs font-bold">Pro Dry-Fit Athletic Sportswear Set</p>
                      <p className="text-[11px] text-[#7A746E]">Size: M | Color: Stealth Black</p>
                    </div>
                    <span className="text-xs text-[#C8452A] font-black">1 x ₹1,299</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FBF3E8] p-3 rounded-2xl border border-[#E8DAC8]">
                    <div>
                      <p className="text-[#1F1F1F] text-xs font-bold">Classic Pique Cotton Polo T-Shirt</p>
                      <p className="text-[11px] text-[#7A746E]">Size: L | Color: Navy Blue</p>
                    </div>
                    <span className="text-xs text-[#C8452A] font-black">1 x ₹799</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF3E8] pt-24 pb-16 px-4 flex items-center justify-center text-[#7A746E] font-medium">
          Loading tracking details...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
