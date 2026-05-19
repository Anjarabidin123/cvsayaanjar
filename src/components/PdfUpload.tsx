import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, X, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface PdfUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function PdfUpload({ value, onChange, label = "Pilih File PDF CV" }: PdfUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      // Validasi tipe file (hanya PDF)
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Hanya file PDF yang diperbolehkan");
        return;
      }

      // Validasi ukuran (maksimal 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal adalah 10MB");
        return;
      }

      const fileExt = "pdf";
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `cv/${fileName}`;

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
        throw new Error("Gagal mendapatkan URL publik PDF");
      }

      onChange(data.publicUrl);
      toast.success("File PDF berhasil diunggah!");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Gagal mengunggah PDF");
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

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
        disabled={uploading}
      />

      {value ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-sm rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4 group"
        >
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">File CV PDF Berhasil Diunggah</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-accent font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              Lihat PDF <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-sm rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/10 bg-card/20"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <p className="text-xs font-medium text-muted-foreground">Mengunggah PDF...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                <Upload className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Seret & letakkan file PDF di sini (Maks 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
