/**
 * Shopping Cart Page
 * Displays cart items, quantity controls, subtotal, and checkout CTA
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
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-light text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-slate-500 font-light mb-6">Looks like you haven't added any products to your cart yet.</p>
        <Link href="/products">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-normal px-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-900">Shopping Cart</h1>
            <p className="text-sm text-slate-500 font-light mt-1">
              You have {totalItems} item{totalItems > 1 ? "s" : ""} in your cart
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-slate-500 hover:text-red-600 font-light">
            <Trash2 className="h-4 w-4 mr-1" /> Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-slate-200">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base font-normal text-slate-900">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1">
                      {item.color && (
                        <Badge variant="outline" className="text-xs font-light text-slate-600 border-slate-300">
                          Color: {item.color}
                        </Badge>
                      )}
                      {item.size && (
                        <Badge variant="outline" className="text-xs font-light text-slate-600 border-slate-300">
                          Size: {item.size}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-normal text-slate-900 mt-2">{formatINR(item.price)}</p>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-light"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-slate-900 text-sm font-normal min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-light"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-base font-normal text-slate-900 min-w-[5rem] text-right">
                      {formatINR(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
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
            <Card className="border-slate-200 shadow-sm sticky top-28">
              <CardHeader>
                <CardTitle className="text-lg font-normal text-slate-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm font-light">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-normal">{formatINR(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax (10%)</span>
                  <span className="text-slate-900 font-normal">{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-slate-900 font-normal">
                    {shipping === 0 ? "FREE" : formatINR(shipping)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-normal text-slate-900">
                  <span>Total</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-normal py-5">
                    Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
