/**
 * Order Tracking & Live Delivery Status Page
 * Visual progress timeline showing: Order Placed -> Left Warehouse -> In Transit -> Out for Delivery -> Delivered
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
  { id: 2, label: "Left Warehouse", time: "Aug 03, 02:45 PM", location: "MPSS Fulfillment Hub, Bengaluru", status: "completed", icon: Building },
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/products" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 font-light">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <h1 className="text-3xl text-slate-900 font-light">Live Order Delivery Status</h1>
            <p className="text-sm text-slate-500 font-light mt-1">Real-time shipment location & delivery tracking</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <Input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order # (e.g. ORD-2026-9001)"
              className="bg-white text-sm font-light w-full sm:w-64"
            />
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-light shrink-0">
              <Search className="w-4 h-4 mr-1" /> Track
            </Button>
          </form>
        </div>

        {/* Tracking Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-slate-900 text-white p-6 rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-light">Order Reference:</span>
                  <span className="text-lg font-mono font-medium text-emerald-400">{activeOrderId}</span>
                </div>
                <p className="text-xs text-slate-300 font-light mt-1">Carrier: Express Air Logistics • AWB: 889104928</p>
              </div>

              <Badge className="bg-emerald-500 text-slate-950 font-normal px-3 py-1.5 self-start sm:self-auto">
                🚚 IN TRANSIT • Arriving Tomorrow
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-10">
            {/* Visual Step-by-Step Delivery Progress Timeline */}
            <div>
              <h3 className="text-sm text-slate-500 font-light uppercase tracking-wider mb-6">Delivery Progress Timeline</h3>

              <div className="relative">
                {/* Desktop Line connecting steps */}
                <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-slate-200 z-0">
                  <div className="h-full bg-emerald-500 w-[55%] transition-all duration-500" />
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
                              ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100"
                              : isActive
                              ? "bg-amber-400 text-slate-950 ring-4 ring-amber-100 animate-pulse"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
                        </div>

                        <div>
                          <p className={`text-sm font-normal ${isActive ? "text-slate-950 font-medium" : "text-slate-700"}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-slate-500 font-light mt-0.5">{step.time}</p>
                          <p className="text-[11px] text-emerald-700 font-light mt-0.5">{step.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Shipment Status Details */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm text-slate-900 font-medium">Package is currently in transit</h4>
                  <p className="text-xs text-slate-600 font-light mt-0.5">Departed regional sorting facility. On schedule for doorstep delivery.</p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-600 text-emerald-800 bg-white shrink-0">
                Updated 15 mins ago
              </Badge>
            </div>

            {/* Package Details */}
            <div className="border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-light">
              <div>
                <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                <p className="text-slate-900 font-normal">Rahul Sharma</p>
                <p className="text-slate-600">123 MG Road, Indiranagar</p>
                <p className="text-slate-600">Bengaluru, Karnataka - 560001</p>
                <p className="text-slate-600">Phone: +91 9123456789</p>
              </div>

              <div>
                <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Order Contents</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-slate-900 text-xs font-normal">Pro Dry-Fit Athletic Sportswear Set</p>
                      <p className="text-[11px] text-slate-500">Size: M | Color: Stealth Black</p>
                    </div>
                    <span className="text-xs text-slate-700 font-mono">1 x ₹1,299</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-slate-900 text-xs font-normal">Classic Pique Cotton Polo T-Shirt</p>
                      <p className="text-[11px] text-slate-500">Size: L | Color: Navy Blue</p>
                    </div>
                    <span className="text-xs text-slate-700 font-mono">1 x ₹799</span>
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
        <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 flex items-center justify-center text-slate-500 font-light">
          Loading tracking details...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
