'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Plus, Check } from 'lucide-react';

interface PhotoItem {
  id?: string;
  type?: 'measurement' | 'inspection' | 'defect';
  photoUrl: string;
  description?: string;
  defectCode?: string;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  type: 'measurement' | 'inspection' | 'defect';
  single?: boolean;
  title?: string;
  subtitle?: string;
}

export function PhotoUploader({
  photos,
  onChange,
  type,
  single = false,
  title = 'Upload Photos',
  subtitle = 'Take a photo or choose an existing file',
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];

      // Convert to base64 for instant client-side preview & upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        // Upload to server API
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, filename: file.name }),
        });

        const data = await res.json();
        const finalUrl = data.url || base64Data;

        const newPhoto: PhotoItem = {
          type,
          photoUrl: finalUrl,
          description: captionInput || (type === 'measurement' ? 'Measurement Chart' : ''),
        };

        if (single) {
          onChange([newPhoto]);
        } else {
          onChange([...photos, newPhoto]);
        }
        setCaptionInput('');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Photo upload error:', err);
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateCaption = (index: number, newCaption: string) => {
    const updated = photos.map((p, i) => (i === index ? { ...p, description: newCaption } : p));
    onChange(updated);
  };

  const movePhoto = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= photos.length) return;
    const updated = [...photos];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}

      {/* Upload Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Direct Phone Camera Button */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-md shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
        >
          <Camera className="w-5 h-5" />
          <span className="text-sm">TAKE PHOTO</span>
        </button>

        {/* Upload Existing File Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition"
        >
          <Upload className="w-5 h-5" />
          <span className="text-sm">UPLOAD FILE</span>
        </button>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-2 p-3 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Uploading & optimizing image...
        </div>
      )}

      {/* Uploaded Photos List / Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex gap-3 items-center"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                <img
                  src={photo.photoUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption & Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Photo #{idx + 1} {photo.defectCode ? `(${photo.defectCode})` : ''}
                </p>
                <input
                  type="text"
                  placeholder="Enter description..."
                  value={photo.description || ''}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Reorder and Delete controls */}
              <div className="flex flex-col gap-1 items-center">
                <button
                  type="button"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => movePhoto(idx, idx - 1)}
                  className="px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={idx === photos.length - 1}
                  onClick={() => movePhoto(idx, idx + 1)}
                  className="px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                >
                  ▼
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => removePhoto(idx)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
