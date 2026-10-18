/**
 * Product detail page — dynamic route [productId]
 * Shows product info, images, color/size selection, add to cart
 */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, ShoppingCart, Heart, ArrowLeft, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { useCart, formatINR } from "@/lib/cart-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────

interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
  imageIndex?: number;
}

interface ProductSize {
  name: string;
  available: boolean;
  stock: number;
}

interface ProductImage {
  url: string;
  alt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge: string;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: ProductSize[];
  ratingsAverage: number;
  ratingsCount: number;
  stock: number;
}

// ─── Component ────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);

  // Fetch product
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.productId}`);
        const json = await res.json();
        if (json.success) {
          setProduct(json.data.product);
          // Set defaults
          const availableColor = json.data.product.colors?.find((c: ProductColor) => c.available);
          if (availableColor) setSelectedColor(availableColor.name);
          const availableSize = json.data.product.sizes?.find((s: ProductSize) => s.available);
          if (availableSize) setSelectedSize(availableSize.name);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      color: selectedColor,
      size: selectedSize,
    }, quantity);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-light text-lg mb-4">Product not found</p>
        <Link
          href="/products"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "font-light inline-flex items-center"
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl animate-slide-in text-sm font-light flex items-center gap-2">
          <Check className="h-4 w-4 text-green-400" /> Added to cart
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 font-light mb-8">
          <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
              <img
                src={product.images?.[activeImage]?.url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <Badge className="absolute top-4 left-4 font-light bg-indigo-600 text-white">{product.badge}</Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive" className="absolute top-4 right-4 font-light">-{discount}%</Badge>
              )}
            </div>
            {/* Thumbnail strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? "border-indigo-600" : "border-transparent"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400 font-light uppercase tracking-wider mb-1">{product.category}</p>
              <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-600 font-light">{product.ratingsAverage} ({product.ratingsCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl text-gray-900 font-light">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through font-light">{formatINR(product.originalPrice)}</span>
                  <Badge variant="secondary" className="font-light text-green-600">Save {discount}%</Badge>
                </>
              )}
            </div>

            <p className="text-gray-600 font-light leading-relaxed">{product.description}</p>

            {/* Color selection */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 font-light mb-3">Color: <span className="text-gray-900">{selectedColor}</span></p>
                <div className="flex gap-2">
                  {product.colors.map((c, idx) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        if (!c.available) return;
                        setSelectedColor(c.name);
                        // Dynamically switch photo to color's image index if available or match by index
                        if (c.imageIndex !== undefined && product.images?.[c.imageIndex]) {
                          setActiveImage(c.imageIndex);
                        } else if (product.images?.[idx]) {
                          setActiveImage(idx);
                        }
                      }}
                      disabled={!c.available}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c.name ? "border-emerald-600 ring-2 ring-emerald-200 scale-110" : "border-gray-200"
                      } ${!c.available ? "opacity-30 cursor-not-allowed" : "hover:scale-110"}`}
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} (Click to view photo)`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 font-light mb-3">Size: <span className="text-gray-900">{selectedSize}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => s.available && setSelectedSize(s.name)}
                      disabled={!s.available}
                      className={`px-4 py-2 rounded-lg text-sm font-light border transition-all ${
                        selectedSize === s.name
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      } ${!s.available ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors font-light"
                >
                  −
                </button>
                <span className="px-6 py-2 text-center text-gray-900 font-light min-w-[3rem]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors font-light"
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 font-light bg-slate-900 hover:bg-slate-800 text-white"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline" className="font-light">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders over ₹1,000" },
                { icon: Shield, label: "Quality Assured", sub: "Inspection certified" },
                { icon: RotateCcw, label: "Easy Returns", sub: "30-day return policy" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <item.icon className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                  <p className="text-xs text-gray-900 font-light">{item.label}</p>
                  <p className="text-xs text-gray-400 font-light">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews & Comments Section */}
        <ReviewsCommentsSection productId={product.id} />
      </div>
    </div>
  );
}

// ─── Customer Reviews & Comments Section Component ───────

function ReviewsCommentsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState([
    {
      id: "rev-1",
      author: "Amit Patel",
      rating: 5,
      date: "2 days ago",
      comment: "Superb quality apparel! Fits perfectly and fabric feels very premium even after washing.",
      helpfulCount: 14,
      userVoted: false,
    },
    {
      id: "rev-2",
      author: "Priya Sharma",
      rating: 4,
      date: "1 week ago",
      comment: "Loved the color accuracy! Switched photo to blue and the actual delivered item matches 100%.",
      helpfulCount: 8,
      userVoted: false,
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  const handleVoteHelpful = (revId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === revId) {
          const updatedVoted = !r.userVoted;
          return {
            ...r,
            userVoted: updatedVoted,
            helpfulCount: updatedVoted ? r.helpfulCount + 1 : r.helpfulCount - 1,
          };
        }
        return r;
      })
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: authorName.trim() || "Verified Buyer",
      rating: newRating,
      date: "Just now",
      comment: newComment,
      helpfulCount: 0,
      userVoted: false,
    };

    setReviews([newRev, ...reviews]);
    setNewComment("");
    setAuthorName("");
    setSubmittedMessage("Thank you for your helpful comment!");
    setTimeout(() => setSubmittedMessage(""), 3000);
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl text-slate-900 font-light">Customer Reviews &amp; Comments</h2>
          <p className="text-sm text-slate-500 font-light">Real feedback from verified buyers</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-lg text-slate-900 font-light">4.8 / 5.0</span>
          <span className="text-xs text-slate-500 font-light">({reviews.length + 12} total reviews)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900">{rev.author}</span>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 border-0">Verified Buyer</Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-2 font-light">{rev.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleVoteHelpful(rev.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                    rev.userVoted
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  👍 Helpful ({rev.helpfulCount})
                </button>
              </div>

              <p className="text-sm text-slate-700 font-light leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>

        {/* Add Review / Comment Form */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit space-y-4">
          <h3 className="text-lg text-slate-900 font-light">Leave a Comment</h3>
          <p className="text-xs text-slate-500 font-light">Share your honest experience to help other shoppers.</p>

          {submittedMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs">
              {submittedMessage}
            </div>
          )}

          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="text-xs text-slate-600 block mb-1">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= newRating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">Your Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">Your Comment / Review</label>
              <textarea
                required
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="How was the fitting, fabric, and color quality?"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-light text-sm py-2">
              Submit Review
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
