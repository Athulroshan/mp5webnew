/**
 * Shopping Cart Page
 * Displays cart items, quantity controls, subtotal, and checkout CTA
 * Styled with Warm Cream (#FBF3E8) & Terracotta (#C8452A) design system.
 */
"use client";

import React from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart, formatINR } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();

  const tax = totalPrice * 0.1;
  const shipping = totalPrice > 1000 || totalPrice === 0 ? 0 : 100;
  const finalTotal = totalPrice + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FBF3E8] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-full bg-[#F3E6D3] flex items-center justify-center mb-5 text-[#C8452A]">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <p className="eyebrow-label mb-2">CART IS EMPTY</p>
        <h1 className="text-3xl font-extrabold text-[#1F1F1F] mb-3">Your Cart is Currently Empty</h1>
        <p className="text-sm text-[#4A4540] max-w-sm text-center mb-8">
          Explore our collection of custom blanks, sportswear, caps, and hoodies or customize any garment live in 3D.
        </p>
        <Link
          href="/products"
          className="btn-pill-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow-label mb-1">REVIEW ITEMS</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F]">
              Shopping <span className="text-[#C8452A]">Cart</span>
            </h1>
            <p className="text-sm text-[#7A746E] mt-1 font-medium">
              You have {totalItems} item{totalItems > 1 ? "s" : ""} ready in your order
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-[#7A746E] hover:text-[#C8452A] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-full hover:bg-[#F3E6D3]"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-[#E8DAC8] rounded-[24px] bg-white shadow-xs">
                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-[#F3E6D3] overflow-hidden shrink-0 border border-[#E8DAC8]">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base font-bold text-[#1F1F1F]">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1.5">
                      {item.color && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3E6D3] text-[#1F1F1F]">
                          Color: {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3E6D3] text-[#1F1F1F]">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-[#C8452A] mt-2">{formatINR(item.price)}</p>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#E8DAC8] rounded-full overflow-hidden bg-[#FBF3E8]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-[#1F1F1F] hover:bg-[#F3E6D3] font-bold text-sm"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-[#1F1F1F] text-xs font-bold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-[#1F1F1F] hover:bg-[#F3E6D3] font-bold text-sm"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-base font-black text-[#1F1F1F] min-w-[5rem] text-right">
                      {formatINR(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#7A746E] hover:text-[#C8452A] p-1.5 rounded-full hover:bg-[#F7ECE9] transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-[#E8DAC8] rounded-[24px] bg-white shadow-xs sticky top-28 p-6">
              <CardHeader className="p-0 pb-4 border-b border-[#E8DAC8]">
                <CardTitle className="text-lg font-bold text-[#1F1F1F]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-sm p-0 py-4">
                <div className="flex justify-between text-[#4A4540]">
                  <span>Subtotal</span>
                  <span className="text-[#1F1F1F] font-bold">{formatINR(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[#4A4540]">
                  <span>Estimated Tax (10%)</span>
                  <span className="text-[#1F1F1F] font-bold">{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between text-[#4A4540]">
                  <span>Shipping</span>
                  <span className="text-[#4A4540] font-bold">
                    {shipping === 0 ? "FREE" : formatINR(shipping)}
                  </span>
                </div>
                <div className="border-t border-[#E8DAC8] pt-3.5 flex justify-between text-lg font-black text-[#1F1F1F]">
                  <span>Total</span>
                  <span className="text-[#C8452A]">{formatINR(finalTotal)}</span>
                </div>
              </CardContent>
              <CardFooter className="p-0 pt-3">
                <Link
                  href="/checkout"
                  className="btn-pill-primary w-full py-3.5 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
