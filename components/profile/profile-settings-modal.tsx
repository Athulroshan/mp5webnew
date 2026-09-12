/**
 * Profile Settings & Edit Profile Modal
 * Allows the user to:
 * - View & upload profile photo with circular preview
 * - Validate strict 50 MB max file size
 * - Support JPG, JPEG, PNG, WEBP, GIF formats
 * - Remove photo to return to default initials avatar
 * - Save profile changes across the application
 */
"use client";

import React, { useState, useEffect } from "react";
import { User, Settings, CheckCircle2, Save, X, Camera } from "lucide-react";
import { useUser } from "@/lib/user-context";
import ImageUploadDropzone from "@/components/ui/image-upload-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ProfileSettingsModal() {
  const { user, updateProfile, isProfileModalOpen, closeProfileModal } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user, isProfileModalOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || "User",
      email: email.trim(),
      role: role.trim(),
      avatarUrl: avatarUrl || null,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      closeProfileModal();
    }, 800);
  };

  if (!user) return null;

  // Get user initials for default avatar fallback
  const getInitials = (userName: string) => {
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isProfileModalOpen} onOpenChange={(open) => !open && closeProfileModal()}>
      <DialogContent className="sm:max-w-md bg-white p-0 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/90 backdrop-blur">
          <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-violet-600 shrink-0" />
            Profile Settings
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-normal">
            Manage your profile picture, name, and account details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6">
          {/* Success Banner */}
          {isSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-bold animate-in fade-in-0 duration-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* ── PROFILE PHOTO SECTION (Requirement 3, 4, 5, 6) ── */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Profile Photo
              </label>
              {avatarUrl && (
                <span className="text-[11px] text-slate-400 font-medium">
                  Circular Avatar Active
                </span>
              )}
            </div>

            {/* Current / Default Avatar Indicator */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-3">
              {avatarUrl ? (
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-violet-500 shadow-sm shrink-0">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                  {getInitials(name || "User")}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{name || "User"}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {avatarUrl ? "Custom Profile Photo" : "Default Initials Avatar"}
                </p>
              </div>
            </div>

            {/* Dropzone Component for Photo Upload */}
            <ImageUploadDropzone
              variant="circle"
              label="Upload Photo"
              value={avatarUrl}
              onChange={(newUrl) => setAvatarUrl(newUrl)}
            />
          </div>

          {/* ── USER DETAILS SECTION ── */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-sm border-slate-200 rounded-xl focus-visible:ring-violet-500"
                placeholder="e.g. Vishnu"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm border-slate-200 rounded-xl focus-visible:ring-violet-500"
                placeholder="user@mpss.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Role / Title</label>
              <Input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-sm border-slate-200 rounded-xl focus-visible:ring-violet-500"
                placeholder="e.g. Garment Quality Auditor"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={closeProfileModal}
              className="text-xs font-bold text-slate-600 border-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
