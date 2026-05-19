import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

/**
 * Backward-compatible ImageUpload component updated to support MULTIPLE screenshots.
 * Stores URLs as a comma-separated string inside the single image_url database column.
 */
export function ImageUpload({ value, onChange, label = "Pilih Gambar" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Split comma-separated URLs
  const urls = value ? value.split(",").map((u) => u.trim()).filter(Boolean) : [];

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diperbolehkan");
        return;
      }

      // Validasi ukuran (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal adalah 5MB");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Unggah ke bucket 'portfolio'
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Ambil Public URL
      const { data } = supabase.storage.from("portfolio").getPublicUrl(filePath);
      
      if (!data?.publicUrl) {
        throw new Error("Gagal mendapatkan URL publik gambar");
      }

      // Append new image URL to the comma-separated list
      const updatedUrls = [...urls, data.publicUrl];
      onChange(updatedUrls.join(", "));
      toast.success("Gambar berhasil diunggah!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.toast ? toast.toast({ description: "Gagal mengunggah gambar" }) : toast.error("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = (indexToRemove: number) => {
    const updatedUrls = urls.filter((_, idx) => idx !== indexToRemove);
    onChange(updatedUrls.length > 0 ? updatedUrls.join(", ") : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />

      {/* Grid of uploaded images */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AnimatePresence>
            {urls.map((url, idx) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted/30 flex items-center justify-center shadow-sm"
              >
                <img
                  src={url}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Delete button on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs"
                    onClick={() => handleRemove(idx)}
                    disabled={uploading}
                  >
                    <X className="w-3.5 h-3.5" /> Hapus
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded text-white border border-white/10 font-mono">
                  #{idx + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Dropzone (hidden if reached max of 8 screenshots for cleaner UI) */}
      {urls.length < 8 && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-sm aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/10 bg-card/20"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-medium text-muted-foreground">Mengunggah gambar...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{urls.length > 0 ? "Tambah Gambar Lain" : label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Maksimal 8 screenshot. Seret & letakkan file di sini
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                  Maksimal file: 5MB (PNG, JPG, WEBP)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
