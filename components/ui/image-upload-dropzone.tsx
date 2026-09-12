/**
 * Reusable Image Upload Dropzone & Resize Workflow Component
 * Workflow: Upload → Preview → Resize/Crop → Confirm → Save
 * Features:
 * - 50 MB strict maximum file size limit
 * - JPG, JPEG, PNG, WEBP, GIF file extensions & MIME validation
 * - Integrated ImageCropEditorModal for interactive resizing and cropping
 * - Supports 1:1, 4:3, 16:9, 3:2, Original aspect ratio presets
 * - Preserves high uncompressed visual quality
 */
"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, AlertCircle, RefreshCw, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageCropEditorModal, { CropRatioOption } from "@/components/ui/image-crop-editor-modal";

interface ImageUploadDropzoneProps {
  label?: string;
  variant?: "circle" | "landscape";
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  maxSizeBytes?: number; // Default 50MB
  aspectRatioLabel?: string;
}

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export default function ImageUploadDropzone({
  label = "Upload Photo",
  variant = "landscape",
  value = null,
  onChange,
  maxSizeBytes = MAX_SIZE_BYTES,
  aspectRatioLabel,
}: ImageUploadDropzoneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal preview if external value changes
  React.useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);

    // 1. File Size Validation (50 MB Limit)
    if (file.size > maxSizeBytes) {
      setErrorMessage("File too large. Please upload an image smaller than 50 MB.");
      return false;
    }

    // 2. Extension Validation
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        "Invalid file format. Supported formats: JPG, JPEG, PNG, WEBP, GIF"
      );
      return false;
    }

    // 3. MIME Content Type Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage(
        "Invalid MIME type. Please upload a valid JPG, JPEG, PNG, WEBP, or GIF image."
      );
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setRawImageSrc(result);
      // Automatically open Crop/Resize Editor modal (Upload → Preview → Resize/Crop → Confirm → Save workflow)
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setRawImageSrc(null);
    setErrorMessage(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    setPreviewUrl(croppedDataUrl);
    onChange(croppedDataUrl);
  };

  const defaultPreset: CropRatioOption = variant === "circle" ? "1:1" : "16:9";

  return (
    <div className="w-full space-y-3">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 font-semibold animate-in fade-in-0 duration-200">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload State or Preview State */}
      {previewUrl ? (
        <div className="flex flex-col items-center space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Preview
          </div>

          {/* Preview Image Container */}
          {variant === "circle" ? (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 shrink-0">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[16/9] max-h-[220px] rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900">
              <img
                src={previewUrl}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (rawImageSrc || previewUrl) {
                  setShowCropModal(true);
                } else {
                  triggerSelect();
                }
              }}
              className="text-xs font-bold text-violet-700 border-violet-200 hover:bg-violet-50 rounded-xl"
            >
              <Crop className="h-3.5 w-3.5 mr-1 text-violet-600" /> Resize / Crop
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerSelect}
              className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100 rounded-xl"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1 text-slate-500" /> Change Photo
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={triggerSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
            isDragging
              ? "border-violet-500 bg-violet-50/80 scale-[1.01]"
              : "border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-400"
          }`}
        >
          {variant === "circle" ? (
            <div className="w-12 h-12 rounded-full bg-violet-100 border border-violet-200 text-violet-600 flex items-center justify-center font-bold text-lg mb-1 shadow-xs">
              ○
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-violet-100 border border-violet-200 text-violet-600 flex items-center justify-center shadow-xs mb-1">
              <UploadCloud className="h-6 w-6" />
            </div>
          )}

          <div className="text-sm font-bold text-slate-800">
            {variant === "circle" ? "Profile Photo" : "Article Cover Image"}
          </div>

          <Button
            type="button"
            size="sm"
            className="bg-slate-900 hover:bg-violet-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            {label}
          </Button>

          <div className="text-[11px] text-slate-500 font-medium space-y-0.5 pt-1">
            <p>Supported formats: JPG, JPEG, PNG, WEBP, GIF</p>
            <p className="font-bold text-slate-600">Maximum file size: 50 MB</p>
            {aspectRatioLabel && (
              <p className="text-slate-400 text-[10px]">{aspectRatioLabel}</p>
            )}
          </div>
        </div>
      )}

      {/* Resize & Crop Editor Modal */}
      {showCropModal && (
        <ImageCropEditorModal
          open={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageSrc={rawImageSrc || previewUrl}
          onConfirm={handleCropConfirm}
          variant={variant}
          initialRatio={variant === "circle" ? "1:1" : "16:9"}
        />
      )}
    </div>
  );
}
