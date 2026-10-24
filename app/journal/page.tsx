/**
 * Garment Industry Knowledge & Technical Journal Platform
 * Editorial-first design placing articles as the primary hero content.
 * Features:
 * - Editorial Featured Quality Guide hero card
 * - Article-first card grid (16:9 cover image, category badge, bold title, excerpt, small circular author avatar)
 * - Three-dot action menu (⋯) for journal owners to Edit or Delete their articles
 * - Strict frontend & logic ownership enforcement (only creator can Edit/Delete)
 * - Write & Edit Article modal with pre-populated fields and 16:9 Cover Image Upload
 * - Delete confirmation modal with destructive action safety
 * - "My Journals" filter pill for logged-in users to manage their publications
 * - Live Toast notifications ("Journal updated successfully", "Journal deleted successfully")
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PenTool,
  ThumbsUp,
  MessageSquare,
  Clock,
  Sparkles,
  Search,
  X,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  MoreVertical,
  Pencil,
  Trash2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUser, UserProfile } from "@/lib/user-context";
import ImageUploadDropzone from "@/components/ui/image-upload-dropzone";

export interface JournalPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  authorAvatar?: string | null;
  category: string;
  date: string;
  readTime: string;
  likes: number;
  commentsCount: number;
  image: string;
  isFeatured?: boolean;
  ownerId?: string;
}

const initialPosts: JournalPost[] = [
  {
    id: "post-1",
    title: "Understanding AQL 2.5 Sampling Inspection in Apparel Export",
    excerpt:
      "A comprehensive guide to AQL standards, defect classification, sampling procedures, major vs minor defect limits, and final shipment clearance.",
    content: `Acceptable Quality Limit (AQL) is the international standard for garment quality control during pre-shipment inspections. Most international fashion buyers mandate AQL 2.5 for major defects and AQL 4.0 for minor defects.

Key checklist items during factory final inspection:
1. **Critical Defects (AQL 0.0)**: Broken needles, sharp metal edges, hazardous chemical stains, missing safety labels.
2. **Major Defects (AQL 2.5)**: Incorrect sizing tolerance (>0.5cm off approved tech pack), open seams, color shading across garment panels, broken zippers.
3. **Minor Defects (AQL 4.0)**: Loose threads, skipped stitches, removable soil marks, untrimmed thread ends.

Implementing digital QA checklists directly during inline production drastically reduces total defect rates before final packing. Regular training of factory inline auditors and maintaining updated tech packs on the shop floor ensures seamless compliance across all production lines.`,
    author: "Vishnu",
    authorRole: "Senior Garment Quality Auditor",
    authorAvatar: null,
    category: "Quality Inspection",
    date: "Sep 10, 2026",
    readTime: "5 min read",
    likes: 64,
    commentsCount: 14,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
    isFeatured: true,
    ownerId: "user-1",
  },
  {
    id: "post-2",
    title: "Cotton vs Polyester & Recycled Blends for Custom Sportswear",
    excerpt:
      "Comparing moisture-wicking performance, tensile strength, color fastness, and eco-sustainability across modern athletic apparel fabrics.",
    content: `Choosing the right fabric blend is critical when manufacturing sportswear and activewear. While 100% combed cotton offers unmatched breathability for casual everyday wear, high-performance sportswear relies on engineered polyester microfiber and spandex.

**Moisture Wicking**: Hydrophobic polyester fibers channel sweat away from skin to the outer fabric layer for quick evaporation.
**Durability**: Polyester-cotton 60/40 blends maintain color fastness over 50+ wash cycles without shrinking.
**Eco-Friendly Recycled Poly**: rPET fibers made from recycled ocean plastics now deliver equal elasticity while cutting carbon footprints by 32%.

When designing teamwear or high-intensity athletic lines, combining 88% Recycled Poly with 12% Spandex provides optimal 4-way stretch and moisture control.`,
    author: "Anita Sharma",
    authorRole: "Textile R&D Specialist",
    authorAvatar: null,
    category: "Fabric Sourcing",
    date: "Sep 08, 2026",
    readTime: "4 min read",
    likes: 42,
    commentsCount: 9,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800",
    ownerId: "user-2",
  },
  {
    id: "post-3",
    title: "How 3D Digital Sampling Reduces Prototype Waste by 70%",
    excerpt:
      "Discover how Three.js, CLO3D, and real-time WebGL garment rendering are transforming traditional physical sampling workflows.",
    content: `Physical sampling has historically been one of the costliest bottlenecks in garment manufacturing — requiring physical pattern cutting, sample stitching, air freighting across continents, and multiple revision rounds.

With real-time WebGL 3D customization studios:
- Buyers approve colors, print positions, scale, and fabric textures digitally.
- Physical sample iterations drop from 4 rounds down to 1 final sign-off sample.
- Material waste, shipping emissions, and sample turnaround lead times are slashed significantly.

Embracing 3D digital twins allows fashion brands and sourcing houses to showcase virtual catalogs before starting factory production lines.`,
    author: "David Chen",
    authorRole: "Apparel Tech Developer",
    authorAvatar: null,
    category: "Apparel Tech",
    date: "Sep 04, 2026",
    readTime: "6 min read",
    likes: 58,
    commentsCount: 18,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    ownerId: "user-3",
  },
  {
    id: "post-4",
    title: "Key Stitching Specifications Every Merchandiser Must Check",
    excerpt:
      "From ISO stitch type 301 lockstitch to 406 coverstitch: a technical cheat sheet for garment merchandisers and factory inspectors.",
    content: `Stitch density (SPI — Stitches Per Inch) directly governs garment seam strength. Standard casual t-shirts require 10–12 SPI, while heavy-duty denim requires 8–10 SPI with heavy spun polyester thread.

Understanding basic stitch types:
- **ISO 301 Lockstitch**: Single needle, standard for hems and collars.
- **ISO 406 2-Needle Coverstitch**: High stretch recovery, essential for athletic sleeve hems and neckbands.
- **ISO 504 3-Thread Overlock**: Encloses raw fabric edges to prevent fraying.

Checking tension balance and needle size (70/10 vs 90/14) prevents puckering on delicate silk or knits.`,
    author: "Priya Nair",
    authorRole: "Garment Merchandiser & Auditor",
    authorAvatar: null,
    category: "Manufacturing",
    date: "Aug 28, 2026",
    readTime: "7 min read",
    likes: 35,
    commentsCount: 7,
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800",
    ownerId: "user-4",
  },
];

const categories = [
  "All Categories",
  "My Journals",
  "Quality Inspection",
  "Fabric Sourcing",
  "Manufacturing",
  "Apparel Tech",
  "Design Trends",
];

/**
 * Check if the currently logged in user is the owner of a journal post
 */
function checkIsOwner(post: JournalPost, user: UserProfile | null): boolean {
  if (!user) return false;
  if (post.ownerId && post.ownerId === user.id) return true;
  if (user.name && post.author.toLowerCase() === user.name.toLowerCase()) return true;
  return false;
}

export default function JournalPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<JournalPost[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  /* ── Dropdown & Action state ── */
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<JournalPost | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* ── Write / Edit modal state ── */
  const [openWriteModal, setOpenWriteModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCategory, setNewCategory] = useState("Quality Inspection");
  const [newContent, setNewContent] = useState("");
  const [newCoverImage, setNewCoverImage] = useState<string | null>(null);

  /* ── Reader modal state ── */
  const [readingPost, setReadingPost] = useState<JournalPost | null>(null);

  // Sync author name with logged-in user if available when creating
  React.useEffect(() => {
    if (user && !newAuthor && !editingPost) {
      setNewAuthor(user.name);
      setNewRole(user.role || "Garment Field Contributor");
    }
  }, [user, newAuthor, editingPost]);

  // Close open dropdown menus on global click
  React.useEffect(() => {
    const handleOutsideClick = () => setOpenMenuPostId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Auto dismiss toast notification after 3.5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLiked = likedPosts[id];
    setLikedPosts((prev) => ({ ...prev, [id]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
    if (readingPost && readingPost.id === id) {
      setReadingPost((prev) =>
        prev ? { ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 } : null
      );
    }
  };

  /* ── Open Write Modal (New) ── */
  const handleOpenWriteNew = () => {
    setEditingPost(null);
    setNewTitle("");
    setNewAuthor(user?.name || "");
    setNewRole(user?.role || "Garment Quality Auditor");
    setNewCategory("Quality Inspection");
    setNewContent("");
    setNewCoverImage(null);
    setOpenWriteModal(true);
  };

  /* ── Open Edit Modal (Existing) ── */
  const handleOpenEdit = (post: JournalPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMenuPostId(null);

    // Ownership check
    if (!checkIsOwner(post, user)) {
      setNotification({
        type: "error",
        message: "Unable to edit journal. Permission denied.",
      });
      return;
    }

    setEditingPost(post);
    setNewTitle(post.title);
    setNewAuthor(post.author);
    setNewRole(post.authorRole);
    setNewCategory(post.category);
    setNewContent(post.content);
    setNewCoverImage(post.image);
    setOpenWriteModal(true);
  };

  /* ── Open Delete Confirmation ── */
  const handleOpenDelete = (post: JournalPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMenuPostId(null);

    // Ownership check
    if (!checkIsOwner(post, user)) {
      setNotification({
        type: "error",
        message: "Unable to delete the journal. Please try again.",
      });
      return;
    }

    setDeletingPost(post);
  };

  /* ── Confirm Delete Action ── */
  const handleConfirmDelete = () => {
    if (!deletingPost) return;

    // Strict ownership verification
    if (!checkIsOwner(deletingPost, user)) {
      setNotification({
        type: "error",
        message: "Unable to delete the journal. Please try again.",
      });
      setDeletingPost(null);
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== deletingPost.id));

    // If reading modal is open for deleted post, close it
    if (readingPost && readingPost.id === deletingPost.id) {
      setReadingPost(null);
    }

    setNotification({
      type: "success",
      message: "Journal deleted successfully",
    });
    setDeletingPost(null);
  };

  /* ── Submit Create or Edit Form ── */
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    if (editingPost) {
      // EDIT WORKFLOW
      if (!checkIsOwner(editingPost, user)) {
        setNotification({
          type: "error",
          message: "Unable to update journal. Permission denied.",
        });
        setOpenWriteModal(false);
        return;
      }

      const updatedPosts = posts.map((p) => {
        if (p.id === editingPost.id) {
          return {
            ...p,
            title: newTitle.trim(),
            excerpt: newContent.trim().slice(0, 160) + "...",
            content: newContent.trim(),
            author: newAuthor.trim() || user?.name || p.author,
            authorRole: newRole.trim() || user?.role || p.authorRole,
            authorAvatar: user?.avatarUrl ?? p.authorAvatar,
            category: newCategory,
            image:
              newCoverImage ||
              p.image ||
              "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
          };
        }
        return p;
      });

      setPosts(updatedPosts);

      // If active reading post is currently open, update its state
      if (readingPost && readingPost.id === editingPost.id) {
        const updated = updatedPosts.find((p) => p.id === editingPost.id);
        if (updated) setReadingPost(updated);
      }

      setNotification({
        type: "success",
        message: "Journal updated successfully",
      });
    } else {
      // CREATE WORKFLOW
      const createdPost: JournalPost = {
        id: `post-${Date.now()}`,
        title: newTitle.trim(),
        excerpt: newContent.trim().slice(0, 160) + "...",
        content: newContent.trim(),
        author: newAuthor.trim() || user?.name || "Anonymous Contributor",
        authorRole: newRole.trim() || user?.role || "Garment Industry Member",
        authorAvatar: user?.avatarUrl || null,
        category: newCategory,
        date: "Just now",
        readTime: `${Math.max(2, Math.ceil(newContent.split(" ").length / 180))} min read`,
        likes: 1,
        commentsCount: 0,
        image:
          newCoverImage ||
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
        isFeatured: false,
        ownerId: user?.id || "user-1",
      };

      setPosts([createdPost, ...posts]);
      setNotification({
        type: "success",
        message: "Journal published successfully",
      });
    }

    setEditingPost(null);
    setNewTitle("");
    setNewContent("");
    setNewCoverImage(null);
    setOpenWriteModal(false);
  };

  /* ── Filter Logic ── */
  const featuredArticle = posts.find((p) => p.isFeatured) || posts[0];
  const gridPosts = posts.filter((p) => p.id !== featuredArticle?.id);

  const filterPost = (p: JournalPost) => {
    let matchesCat = true;
    if (selectedCategory === "My Journals") {
      matchesCat = checkIsOwner(p, user);
    } else if (selectedCategory !== "All Categories") {
      matchesCat = p.category === selectedCategory;
    }

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  };

  const filteredGridPosts = gridPosts.filter(filterPost);
  const showFeaturedInResults =
    featuredArticle &&
    selectedCategory !== "My Journals" &&
    filterPost(featuredArticle);

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F] pt-16 sm:pt-20 pb-20 relative">
      {/* ── FLOATING TOAST NOTIFICATION ───────────────────────────────── */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full shadow-lg border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 text-xs font-bold ${
            notification.type === "success"
              ? "bg-[#1F1F1F] text-white border-[#3A332D]"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-[#C8452A] shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-white shrink-0" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-white/70 hover:text-white p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── EDITORIAL HERO HEADER ────── */}
      <section className="relative py-14 sm:py-20 bg-[#F3E6D3] border-b border-[#E8DAC8] text-[#1F1F1F] overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#EFE2CF] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="eyebrow-label mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#C8452A]" />
                APPAREL SOURCING &amp; QA KNOWLEDGE HUB
              </p>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1F1F1F] leading-tight mb-3">
                Garment Field Journal &amp; <span className="text-[#C8452A]">Technical Insights</span>
              </h1>
              <p className="text-sm sm:text-base text-[#4A4540] font-normal max-w-2xl leading-relaxed">
                Factory-tested QA guidelines, fabric performance benchmarks, 3D digital sampling tech, and auditor notes.
              </p>
            </div>

            {/* Action Bar */}
            <div className="shrink-0 flex items-center gap-3">
              <Button
                onClick={handleOpenWriteNew}
                size="lg"
                className="btn-pill-primary py-3.5 px-7 shadow-xs"
              >
                <PenTool className="h-4 w-4 text-white" />
                <span>Write Article</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY SEARCH & CATEGORY BAR ──────────────────────────────── */}
      <div className="bg-[#FBF3E8]/95 backdrop-blur-md border-b border-[#E8DAC8] sticky top-16 sm:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A746E] mr-1 shrink-0">
              Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#C8452A] text-white shadow-xs"
                    : "bg-[#F3E6D3] text-[#1F1F1F] hover:bg-[#EFE2CF]"
                }`}
              >
                {cat === "My Journals" ? (
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5" />
                    My Journals
                  </span>
                ) : (
                  cat
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7A746E]" />
            <Input
              placeholder="Search guides, topics or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border-[#E8DAC8] rounded-full focus-visible:ring-[#C8452A] bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ───────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* ── FEATURED ARTICLE HERO CARD ───────────────────── */}
        {showFeaturedInResults && featuredArticle && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-600" /> Featured Quality Guide
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Editor&apos;s Pick
              </span>
            </div>

            <Card
              onClick={() => setReadingPost(featuredArticle)}
              className="group overflow-hidden border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white rounded-3xl grid grid-cols-1 lg:grid-cols-12 items-stretch relative"
            >
              {/* Three-dot Action Menu for Owner */}
              {checkIsOwner(featuredArticle, user) && (
                <div className="absolute top-4 right-4 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuPostId(
                        openMenuPostId === featuredArticle.id ? null : featuredArticle.id
                      );
                    }}
                    className="p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md transition-all shadow-md"
                    title="Journal options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuPostId === featuredArticle.id && (
                    <div
                      className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-30 text-xs animate-in fade-in-0 zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(featuredArticle, e)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-2 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                        <span>Edit Journal</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleOpenDelete(featuredArticle, e)}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 font-bold text-red-600 flex items-center gap-2 transition-colors border-t border-slate-100"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        <span>Delete Journal</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Large 16:9 Cover Image Area */}
              <div className="lg:col-span-7 relative bg-slate-950 overflow-hidden min-h-[280px] sm:min-h-[380px]">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />

                <Badge className="absolute top-4 left-4 bg-violet-600 text-white text-xs font-bold border-0 px-3.5 py-1 shadow-md">
                  {featuredArticle.category}
                </Badge>
              </div>

              {/* Editorial Description Content */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{featuredArticle.date}</span>
                    <span>•</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>

                  {/* Large Article Title */}
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight group-hover:text-violet-600 transition-colors">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {featuredArticle.authorAvatar ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={featuredArticle.authorAvatar}
                          alt={featuredArticle.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {featuredArticle.author.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {featuredArticle.author}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {featuredArticle.authorRole}
                      </p>
                    </div>
                  </div>

                  <Button className="bg-slate-900 group-hover:bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors shrink-0">
                    Read Guide →
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ── ALL ARTICLES GRID ────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedCategory === "My Journals"
                ? "My Published Journals"
                : "All Industry Guides & Articles"}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredGridPosts.length + (showFeaturedInResults ? 1 : 0)} articles
            </span>
          </div>

          {filteredGridPosts.length === 0 && !showFeaturedInResults ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                {selectedCategory === "My Journals"
                  ? "You haven't published any journals yet"
                  : "No articles found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedCategory === "My Journals"
                  ? "Share your factory quality experience, fabric inspection notes, or tech pack tips with the industry."
                  : "Try adjusting your category filter or search keywords."}
              </p>
              {selectedCategory === "My Journals" && (
                <Button
                  onClick={handleOpenWriteNew}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl px-4 py-2"
                >
                  <PenTool className="h-3.5 w-3.5 mr-1.5" /> Write Your First Journal
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredGridPosts.map((post) => {
                const isOwner = checkIsOwner(post, user);
                return (
                  <Card
                    key={post.id}
                    onClick={() => setReadingPost(post)}
                    className="group overflow-hidden border border-slate-200/90 hover:border-violet-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col bg-white rounded-3xl relative"
                  >
                    {/* 1. Article Cover Image */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                      {/* 2. Category Badge */}
                      <Badge className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold border-0 px-2.5 py-0.5 shadow-sm">
                        {post.category}
                      </Badge>

                      {/* Three-dot (⋯) Action Menu for Logged-In Owner */}
                      {isOwner && (
                        <div className="absolute top-3 right-3 z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuPostId(
                                openMenuPostId === post.id ? null : post.id
                              );
                            }}
                            className="p-1.5 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white backdrop-blur-md transition-all shadow-md"
                            title="Journal options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuPostId === post.id && (
                            <div
                              className="absolute right-0 mt-1 w-40 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-30 text-xs animate-in fade-in-0 zoom-in-95 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => handleOpenEdit(post, e)}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-2 transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                <span>Edit Journal</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleOpenDelete(post, e)}
                                className="w-full text-left px-3.5 py-2 hover:bg-red-50 font-bold text-red-600 flex items-center gap-2 transition-colors border-t border-slate-100"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                <span>Delete Journal</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>

                        {/* 3. Article Title */}
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-violet-600 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>

                        {/* 4. Article Excerpt */}
                        <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* 5. Author Avatar */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {post.authorAvatar ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                              <img
                                src={post.authorAvatar}
                                alt={post.author}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {post.author.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {post.author}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              {post.authorRole}
                            </p>
                          </div>
                        </div>

                        {/* Card Action Link */}
                        <span className="flex items-center text-xs font-extrabold text-violet-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                          Read <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── WRITE & EDIT ARTICLE MODAL ────────────────────────────────────── */}
      <Dialog open={openWriteModal} onOpenChange={setOpenWriteModal}>
        <DialogContent className="sm:max-w-2xl bg-white p-0 rounded-3xl shadow-2xl w-[95vw] h-[90vh] sm:h-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
          {/* Modal Header */}
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0 bg-slate-50/90 backdrop-blur">
            <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <PenTool className="h-5 w-5 text-violet-600 shrink-0" />
              {editingPost ? "Edit Journal Article" : "Publish Garment Field Article"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              {editingPost
                ? "Modify your article title, cover image, category, or technical body text."
                : "Share factory inspection tips, fabric performance data, or apparel merchandiser workflows."}
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleSavePost} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              {/* Article Cover Image Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Article Cover Image (16:9 Landscape)
                </label>
                <ImageUploadDropzone
                  variant="landscape"
                  label={editingPost ? "Change Cover Image" : "Upload Cover Image"}
                  value={newCoverImage}
                  onChange={(url) => setNewCoverImage(url)}
                  aspectRatioLabel="Recommended aspect ratio: 16:9 landscape"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Article Title *</label>
                <Input
                  placeholder="e.g. Best Practices for Fabric Shrinkage & Shade Auditing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="text-sm border-slate-200 rounded-xl focus-visible:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Author Name *</label>
                  <Input
                    placeholder="e.g. Vishnu"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    required
                    className="text-sm border-slate-200 rounded-xl focus-visible:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role / Designation</label>
                  <Input
                    placeholder="e.g. Senior QA Inspector"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="text-sm border-slate-200 rounded-xl focus-visible:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  {categories
                    .filter((c) => c !== "All Categories" && c !== "My Journals")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Article Body Text *
                </label>
                <Textarea
                  placeholder="Write your technical guide, factory inspection checklist, fabric analysis, or quality guidelines..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="text-sm border-slate-200 rounded-xl min-h-[160px] max-h-[300px] resize-y leading-relaxed focus-visible:ring-violet-500 p-3"
                />
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenWriteModal(false)}
                className="text-slate-600 border-slate-300 hover:bg-slate-100 text-xs sm:text-sm font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 text-xs sm:text-sm shadow-md hover:shadow-violet-500/20 active:scale-[0.98] transition-all rounded-xl"
              >
                <Send className="h-4 w-4 mr-2" />
                {editingPost ? "Save Changes" : "Publish Article"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRMATION DIALOG ────────────────────────────────────── */}
      <Dialog open={!!deletingPost} onOpenChange={(open) => !open && setDeletingPost(null)}>
        {deletingPost && (
          <DialogContent className="sm:max-w-md bg-white p-6 rounded-3xl shadow-2xl border border-slate-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-3 bg-red-100 rounded-2xl shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900">
                    Delete this journal?
                  </DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">
                    {deletingPost.title}
                  </p>
                </div>
              </div>

              <DialogDescription className="text-xs text-slate-600 font-normal leading-relaxed">
                This action cannot be undone. Are you sure you want to permanently delete this journal?
              </DialogDescription>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingPost(null)}
                  className="text-xs font-bold text-slate-600 border-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Journal
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── FULL ARTICLE READER MODAL ────────────────────────────────────── */}
      <Dialog open={!!readingPost} onOpenChange={(open) => !open && setReadingPost(null)}>
        {readingPost && (
          <DialogContent className="sm:max-w-3xl bg-white p-0 rounded-3xl shadow-2xl w-[95vw] h-[90vh] sm:h-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0 bg-slate-50/90 backdrop-blur">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-violet-600 text-white text-[11px] font-bold border-0">
                    {readingPost.category}
                  </Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">{readingPost.readTime}</span>
                </div>

                {/* Owner controls inside reader modal */}
                {checkIsOwner(readingPost, user) && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const target = readingPost;
                        setReadingPost(null);
                        handleOpenEdit(target);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = readingPost;
                        setReadingPost(null);
                        handleOpenDelete(target);
                      }}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                )}
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {readingPost.title}
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable Article Body */}
            <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 overscroll-contain">
              {/* Author Banner */}
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                {readingPost.authorAvatar ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-violet-300 shrink-0">
                    <img
                      src={readingPost.authorAvatar}
                      alt={readingPost.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {readingPost.author.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{readingPost.author}</h4>
                  <p className="text-xs text-slate-500">
                    {readingPost.authorRole} • Published {readingPost.date}
                  </p>
                </div>
              </div>

              {/* Large Featured Article Image */}
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={readingPost.image}
                  alt={readingPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content Text */}
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {readingPost.content}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 sticky bottom-0 z-20">
              <button
                onClick={() => handleLike(readingPost.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-bold text-xs sm:text-sm ${
                  likedPosts[readingPost.id]
                    ? "bg-violet-100 text-violet-700"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${
                    likedPosts[readingPost.id] ? "fill-violet-700 text-violet-700" : ""
                  }`}
                />
                <span>{readingPost.likes} Likes</span>
              </button>

              <Button
                variant="outline"
                onClick={() => setReadingPost(null)}
                className="text-slate-600 border-slate-300 hover:bg-slate-100 text-xs sm:text-sm font-semibold rounded-xl"
              >
                Close Article
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

