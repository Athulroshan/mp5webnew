/**
 * Site header with responsive navigation
 * Fixed top bar with scroll-aware backdrop and mobile sheet menu
 * Contextual navbar links tailored for Products vs Services sections
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, User, ChevronRight, ChevronDown, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
}

const productsNavLinks: NavItem[] = [
  { label: "Products", href: "/products" },
  { label: "Manufacturing Process", href: "/products/manufacturing-process" },
  { label: "Custom Studio", href: "/customization" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

const servicesNavLinks: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Inspection Process", href: "/services/inspection-process" },
  { label: "QA Inspection", href: "/inspections" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, openProfileModal } = useUser();
  const pathname = usePathname();

  // Detect whether current page is under Services context
  const isServicesSection =
    pathname?.startsWith("/services") ||
    pathname?.startsWith("/inspections") ||
    pathname?.startsWith("/journal");

  const currentNavLinks = isServicesSection ? servicesNavLinks : productsNavLinks;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-0"
          : "bg-white border-b border-slate-100 py-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo & Section Segment */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white shrink-0 p-1 flex items-center justify-center group-hover:border-violet-300 transition-colors">
                <img
                  src="/logo.jpg"
                  alt="MPSS Logo"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-violet-600 transition-colors">
                    MPSS
                  </span>
                  <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md hidden md:inline-flex">
                    GARMENTS
                  </Badge>
                </div>
                <span className="text-[10px] text-slate-500 tracking-wider uppercase font-extrabold">
                  Sourcing Solutions
                </span>
              </div>
            </Link>

            {/* Section Switcher Pill */}
            <div className="hidden xl:flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/80 text-xs font-bold">
              <Link
                href="/products"
                className={`px-3.5 py-1 rounded-full transition-all duration-200 ${
                  !isServicesSection
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Products
              </Link>
              <Link
                href="/services"
                className={`px-3.5 py-1 rounded-full transition-all duration-200 ${
                  isServicesSection
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Services
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {currentNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 relative group whitespace-nowrap ${
                    isActive
                      ? "text-violet-700 bg-violet-50/80 font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-violet-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/products">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Search"
              >
                <Search className="h-4.5 w-4.5" />
              </Button>
            </Link>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Cart"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black bg-violet-600 text-white border-2 border-white shadow-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Logged-in User Profile Compact Avatar (Requirement 2) */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer text-left"
                  title="Click to view & edit profile settings"
                >
                  {/* Small Circular Avatar (36px) */}
                  {user.avatarUrl ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-violet-400 shadow-xs shrink-0">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs border border-violet-300">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "U"}
                    </div>
                  )}

                  {/* Compact User Name & Dropdown indicator */}
                  <div className="hidden xl:flex flex-col pr-1">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                      My Profile <ChevronDown className="h-3 w-3 text-slate-400" />
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-slate-900 hover:bg-violet-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors duration-200 flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5 text-violet-300" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Sheet Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="lg:hidden p-2 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-6 flex flex-col justify-between bg-white">
              <div>
                <SheetHeader>
                  <SheetTitle className="text-left font-black text-slate-900 flex items-center gap-3 border-b pb-4">
                    <img src="/logo.jpg" alt="MPSS Logo" className="w-9 h-9 object-contain rounded-lg border" />
                    <div className="flex flex-col">
                      <span className="text-base font-black">MPSS Sourcing</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Garment Manufacturing</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Section Mode Switcher in Mobile Sheet */}
                <div className="mt-5 bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
                  <Link
                    href="/products"
                    onClick={() => setSheetOpen(false)}
                    className={`flex-1 text-center py-2 rounded-lg transition-colors ${
                      !isServicesSection ? "bg-violet-600 text-white shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Products
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setSheetOpen(false)}
                    className={`flex-1 text-center py-2 rounded-lg transition-colors ${
                      isServicesSection ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Services
                  </Link>
                </div>

                {/* Mobile Navigation List */}
                <nav className="mt-6 flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-1">
                    Navigation Menu
                  </span>
                  {currentNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        className={`px-3.5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                          isActive
                            ? "bg-violet-50 text-violet-700 font-black"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4 text-violet-600" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Sheet Footer Actions */}
              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/cart"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-slate-600" />
                    <span>View Shopping Cart</span>
                  </div>
                  <Badge className="bg-violet-600 text-white text-[10px] font-extrabold px-2 py-0.5">
                    {totalItems} items
                  </Badge>
                </Link>

                {user ? (
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      openProfileModal();
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-left"
                  >
                    {user.avatarUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-violet-500 shadow-xs shrink-0">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-violet-600 font-semibold">
                        Profile Settings &amp; Photo
                      </span>
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-violet-600 transition-colors"
                  >
                    <User className="h-4 w-4 text-violet-300" />
                    <span>Account Sign In</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

