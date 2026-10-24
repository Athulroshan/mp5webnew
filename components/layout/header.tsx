/**
 * Site header with responsive navigation
 * Fixed top bar styled with Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 * Minimalist outlined M emblem brand mark & seamless section switching.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, User, ChevronRight, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useUser } from "@/lib/user-context";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MLogo from "@/components/ui/m-logo";
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
  { label: "Manufacturing", href: "/products/manufacturing-process" },
  { label: "Custom Studio", href: "/customization" },
  { label: "Track Order", href: "/track-order" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const servicesNavLinks: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Inspection Process", href: "/services/inspection-process" },
  { label: "QA Dashboard", href: "/inspections" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
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
          ? "bg-[#FBF3E8]/95 backdrop-blur-md shadow-xs border-b border-[#E8DAC8] py-0"
          : "bg-[#FBF3E8] border-b border-[#E8DAC8]/70 py-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo & Section Switcher */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl border border-[#E8DAC8] bg-[#FBF3E8] p-1 flex items-center justify-center group-hover:border-[#C8452A] transition-colors shadow-xs">
                <MLogo size={32} strokeColor="#1F1F1F" className="group-hover:stroke-[#C8452A] transition-colors" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-[#1F1F1F] group-hover:text-[#C8452A] transition-colors">
                    MPSS
                  </span>
                  <Badge className="bg-[#EFF3EB] text-[#4A5B38] border border-[#4A5B38]/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden md:inline-flex">
                    APPAREL &amp; QA
                  </Badge>
                </div>
                <span className="text-[10px] text-[#7A746E] tracking-wider uppercase font-semibold">
                  Sourcing Solutions
                </span>
              </div>
            </Link>

            {/* Section Switcher Pill */}
            <div className="hidden md:flex items-center bg-[#F3E6D3] p-1 rounded-full border border-[#E8DAC8] text-xs font-semibold">
              <Link
                href="/products"
                className={`px-3.5 py-1 rounded-full transition-all duration-200 ${
                  !isServicesSection
                    ? "bg-[#C8452A] text-white shadow-xs"
                    : "text-[#4A4540] hover:text-[#1F1F1F]"
                }`}
              >
                Products
              </Link>
              <Link
                href="/services"
                className={`px-3.5 py-1 rounded-full transition-all duration-200 ${
                  isServicesSection
                    ? "bg-[#C8452A] text-white shadow-xs"
                    : "text-[#4A4540] hover:text-[#1F1F1F]"
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
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 relative group whitespace-nowrap ${
                    isActive
                      ? "text-[#C8452A] bg-[#F7ECE9] font-bold"
                      : "text-[#4A4540] hover:text-[#1F1F1F] hover:bg-[#F3E6D3]/60"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#C8452A] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-10 w-10 rounded-full text-[#4A4540] hover:text-[#1F1F1F] hover:bg-[#F3E6D3]/60 inline-flex items-center justify-center transition-colors"
              )}
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </Link>

            <Link
              href="/cart"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "relative h-10 w-10 rounded-full text-[#4A4540] hover:text-[#1F1F1F] hover:bg-[#F3E6D3]/60 inline-flex items-center justify-center transition-colors"
              )}
              aria-label="Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-[#C8452A] text-white border-2 border-[#FBF3E8] shadow-xs">
                  {totalItems}
                </Badge>
              )}
            </Link>

            <div className="h-5 w-px bg-[#E8DAC8] mx-1" />

            {/* Logged-in User Profile Compact Avatar */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-2.5 p-1.5 rounded-full bg-[#FBF3E8] hover:bg-[#F3E6D3] border border-[#E8DAC8] transition-all cursor-pointer text-left"
                  title="Click to view & edit profile settings"
                >
                  {user.avatarUrl ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C8452A] shadow-xs shrink-0">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#C8452A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
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

                  <div className="hidden xl:flex flex-col pr-1">
                    <span className="text-xs font-bold text-[#1F1F1F] leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[#7A746E] font-medium flex items-center gap-0.5">
                      My Profile <ChevronDown className="h-3 w-3 text-[#7A746E]" />
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#C8452A] hover:bg-[#B03820] text-white font-bold text-xs px-4 py-2 rounded-full shadow-xs transition-all hover:-translate-y-0.5 inline-flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-white/90" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Sheet Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="lg:hidden p-2 text-[#1F1F1F] hover:text-[#C8452A] rounded-full hover:bg-[#F3E6D3] transition-colors">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-6 flex flex-col justify-between bg-[#FBF3E8] border-l border-[#E8DAC8]">
              <div>
                <SheetHeader>
                  <SheetTitle className="text-left font-black text-[#1F1F1F] flex items-center gap-3 border-b border-[#E8DAC8] pb-4">
                    <MLogo size={32} strokeColor="#1F1F1F" />
                    <div className="flex flex-col">
                      <span className="text-base font-extrabold text-[#1F1F1F]">MPSS Sourcing</span>
                      <span className="text-[10px] text-[#7A746E] font-semibold uppercase tracking-wider">Garments &amp; Inspection</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Section Mode Switcher in Mobile Sheet */}
                <div className="mt-5 bg-[#F3E6D3] p-1 rounded-full flex text-xs font-semibold border border-[#E8DAC8]">
                  <Link
                    href="/products"
                    onClick={() => setSheetOpen(false)}
                    className={`flex-1 text-center py-2 rounded-full transition-colors ${
                      !isServicesSection ? "bg-[#C8452A] text-white shadow-xs" : "text-[#4A4540]"
                    }`}
                  >
                    Products
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setSheetOpen(false)}
                    className={`flex-1 text-center py-2 rounded-full transition-colors ${
                      isServicesSection ? "bg-[#C8452A] text-white shadow-xs" : "text-[#4A4540]"
                    }`}
                  >
                    Services
                  </Link>
                </div>

                {/* Mobile Navigation List */}
                <nav className="mt-6 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A746E] px-3 mb-1">
                    Navigation Menu
                  </span>
                  {currentNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        className={`px-3.5 py-3 rounded-full text-sm font-semibold transition-all flex items-center justify-between ${
                          isActive
                            ? "bg-[#F7ECE9] text-[#C8452A] font-bold"
                            : "text-[#4A4540] hover:bg-[#F3E6D3]/60"
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4 text-[#C8452A]" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Sheet Footer Actions */}
              <div className="border-t border-[#E8DAC8] pt-4 space-y-2">
                <Link
                  href="/cart"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-full bg-white border border-[#E8DAC8] text-[#1F1F1F] text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-[#C8452A]" />
                    <span>Shopping Cart</span>
                  </div>
                  <Badge className="bg-[#C8452A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalItems} items
                  </Badge>
                </Link>

                {user ? (
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      openProfileModal();
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-2xl bg-white border border-[#E8DAC8] hover:bg-[#F3E6D3] transition-colors text-left"
                  >
                    {user.avatarUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8452A] shadow-xs shrink-0">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#C8452A] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
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
                      <span className="text-xs font-bold text-[#1F1F1F] block truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-[#C8452A] font-semibold">
                        Profile Settings &amp; Photo
                      </span>
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#C8452A] text-white text-xs font-bold shadow-xs hover:bg-[#B03820] transition-colors"
                  >
                    <User className="h-4 w-4 text-white" />
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
