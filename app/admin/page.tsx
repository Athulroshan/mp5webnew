"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Layers,
  Search,
  ExternalLink,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatINR } from "@/lib/cart-context";

interface ImageMedia {
  url: string;
  alt: string;
}

interface VideoMedia {
  url: string;
  title: string;
  thumbnail: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Product Form
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "Ethnic Wear",
    stock: "50",
    badge: "Sale",
    brand: "",
  });

  // Dynamic Unlimited Media Attachments
  const [images, setImages] = useState<ImageMedia[]>([
    { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800", alt: "Product View 1" }
  ]);
  const [videos, setVideos] = useState<VideoMedia[]>([]);

  // Input states for adding new media item
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  // Check Auth & Fetch Data
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const savedUserStr = localStorage.getItem("user");

      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        setUser(savedUser);
      }

      // Fetch Products
      const pRes = await fetch("/api/products?limit=100");
      const pData = await pRes.json();
      if (pData.success) setProducts(pData.data.products);

      // Fetch Analytics
      const aRes = await fetch("/api/admin/analytics", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const aData = await aRes.json();
      if (aData.success) {
        setAnalytics(aData.data);
        if (aData.data.recentOrders) setOrders(aData.data.recentOrders);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  // Dynamic Image Handlers
  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, { url: newImageUrl.trim(), alt: newImageAlt.trim() || "Product Image" }]);
    setNewImageUrl("");
    setNewImageAlt("");
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Dynamic Video Handlers
  const addVideo = () => {
    if (!newVideoUrl.trim()) return;
    setVideos([...videos, { url: newVideoUrl.trim(), title: newVideoTitle.trim() || "Product Video", thumbnail: "" }]);
    setNewVideoUrl("");
    setNewVideoTitle("");
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // Submit New Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
          category: productForm.category,
          brand: productForm.brand,
          stock: parseInt(productForm.stock) || 0,
          badge: productForm.badge,
          images: images.length > 0 ? images : [{ url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800", alt: productForm.name }],
          videos: videos,
          colors: [{ name: "Default", hex: "#000000", available: true }],
          sizes: [{ name: "Standard", available: true, stock: parseInt(productForm.stock) || 0 }],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setProductForm({
          name: "",
          description: "",
          price: "",
          originalPrice: "",
          category: "Ethnic Wear",
          stock: "50",
          badge: "Sale",
          brand: "",
        });
        setImages([]);
        setVideos([]);
        loadData();
      } else {
        alert(json.message || "Failed to create product");
      }
    } catch (err) {
      console.error("Create product error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pt-20">
      {/* Admin Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 py-4 px-6 fixed top-0 left-0 right-0 z-40 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950">
            M
          </div>
          <div>
            <h1 className="text-base tracking-wide">MPSS Admin Dashboard</h1>
            <p className="text-[11px] text-slate-400">Authenticated: {user?.email || "admin@mpss.com"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>

          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Tabs defaultValue="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <TabsList className="bg-slate-100 p-1 rounded-lg">
              <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Package className="w-4 h-4 mr-2" />
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics & Reports
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Create Product Dialog Trigger */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors shadow-sm cursor-pointer">
                <Plus className="w-4 h-4" />
                Add New Product
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create New Product</DialogTitle>
                  <CardDescription>Upload product details along with unlimited images and video attachments.</CardDescription>
                </DialogHeader>

                <form onSubmit={handleCreateProduct} className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700">Product Name *</label>
                      <Input
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. Classic Embroidered Kurta Set"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700">Category *</label>
                      <Select
                        value={productForm.category}
                        onValueChange={(val) => setProductForm({ ...productForm, category: val || "Ethnic Wear" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ethnic Wear">Ethnic Wear</SelectItem>
                          <SelectItem value="Western Wear">Western Wear</SelectItem>
                          <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                          <SelectItem value="Footwear">Footwear</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Kids Wear">Kids Wear</SelectItem>
                          <SelectItem value="Home & Living">Home & Living</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700">Price (₹) *</label>
                      <Input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="1499"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700">Original / MRP Price (₹)</label>
                      <Input
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                        placeholder="3999"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700">Brand</label>
                      <Input
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        placeholder="e.g. Sangria / Roadster"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-700">Stock Count</label>
                      <Input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-700">Description *</label>
                    <Textarea
                      required
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Detailed product specification and features..."
                    />
                  </div>

                  {/* UNLIMITED IMAGES SECTION */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-sm text-slate-900">Image Attachments ({images.length})</h3>
                      </div>
                      <span className="text-xs text-slate-500">Unlimited admin upload URLs</span>
                    </div>

                    {/* Add Image Controls */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Paste Image URL (https://...)"
                        className="bg-white flex-1"
                      />
                      <Input
                        value={newImageAlt}
                        onChange={(e) => setNewImageAlt(e.target.value)}
                        placeholder="Alt text / Label"
                        className="bg-white sm:w-40"
                      />
                      <Button type="button" onClick={addImage} variant="outline" className="bg-white border-slate-300">
                        <Plus className="w-4 h-4 mr-1" /> Add Image
                      </Button>
                    </div>

                    {/* Image Previews */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                          <img src={img.url} alt={img.alt} className="w-full h-24 object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* UNLIMITED VIDEOS SECTION */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <VideoIcon className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-sm text-slate-900">Video Attachments ({videos.length})</h3>
                      </div>
                      <span className="text-xs text-slate-500">Unlimited MP4 / Demo links</span>
                    </div>

                    {/* Add Video Controls */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="Paste Video URL (.mp4 or link)"
                        className="bg-white flex-1"
                      />
                      <Input
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        placeholder="Video Title (e.g. 360 View)"
                        className="bg-white sm:w-44"
                      />
                      <Button type="button" onClick={addVideo} variant="outline" className="bg-white border-slate-300">
                        <Plus className="w-4 h-4 mr-1" /> Add Video
                      </Button>
                    </div>

                    {/* Video Previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {videos.map((vid, idx) => (
                        <div key={idx} className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5 bg-white text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <VideoIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="truncate font-medium">{vid.title || vid.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(idx)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white px-6">
                      {submitting ? "Saving Product..." : "Save Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* TAB 1: PRODUCTS TABLE */}
          <TabsContent value="products" className="space-y-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100">
                <div>
                  <CardTitle className="text-lg">Product Management</CardTitle>
                  <CardDescription>View, manage, and remove active catalog products.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Search by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Media</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => {
                      const imageCount = Array.isArray(p.images) ? p.images.length : 0;
                      const videoCount = Array.isArray(p.videos) ? p.videos.length : 0;
                      const firstImg = Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";

                      return (
                        <TableRow key={p.id} className="hover:bg-slate-50/80">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <img src={firstImg} alt={p.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                              <div>
                                <p className="text-slate-900 line-clamp-1">{p.name}</p>
                                <p className="text-xs text-slate-400">SKU: {p.sku}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                              {p.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-900">
                            {formatINR(p.price)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${p.stock < 10 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {p.stock} units
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> {imageCount}</span>
                              <span className="flex items-center gap-1"><VideoIcon className="w-3.5 h-3.5" /> {videoCount}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleDeleteProduct(p.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: ANALYTICS & REPORTS */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total Products</CardDescription>
                  <CardTitle className="text-2xl text-slate-900">{analytics?.totalProducts || products.length}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-emerald-600 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Catalog Items Active
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total Orders</CardDescription>
                  <CardTitle className="text-2xl text-slate-900">{analytics?.totalOrders || orders.length}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-blue-600 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> Customer Purchases
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total Revenue</CardDescription>
                  <CardTitle className="text-2xl text-slate-900">{formatINR(analytics?.totalRevenue || 4347)}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Low Stock Alert</CardDescription>
                  <CardTitle className="text-2xl text-amber-600">
                    {analytics?.lowStockProducts?.length || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Items under 10 units
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown Table & Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Category Distribution</CardTitle>
                  <CardDescription>Breakdown of products and stock by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.categoryData?.map((item: any) => (
                      <div key={item.category} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="text-sm text-slate-900">{item.category}</p>
                          <p className="text-xs text-slate-500">{item.productsCount} Products</p>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {item.totalStock} in stock
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Sales Performance Trend</CardTitle>
                  <CardDescription>Monthly revenue trajectory (in ₹)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.salesTrend?.map((st: any) => (
                      <div key={st.month} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{st.month}</span>
                          <span>{formatINR(st.sales)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-slate-900 h-full rounded-full"
                            style={{ width: `${Math.min(100, (st.sales / 100000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: ORDERS */}
          <TabsContent value="orders">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Recent Customer Orders</CardTitle>
                <CardDescription>Track status and totals of customer orders.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Order #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((ord) => (
                      <TableRow key={ord.id}>
                        <TableCell>{ord.orderNumber}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-800 border-0 uppercase text-[10px]">
                            {ord.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-xs text-slate-600">{ord.paymentStatus}</TableCell>
                        <TableCell className="text-slate-900">{formatINR(ord.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
