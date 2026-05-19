import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { PdfUpload } from "@/components/PdfUpload";

export const Route = createFileRoute("/admin/profile")({
  component: ProfileAdmin,
});

function ProfileAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").limit(1).maybeSingle()).data,
  });

  const [form, setForm] = useState({
    full_name: "", title: "", bio: "", email: "", location: "", avatar_url: "",
    linkedin: "", github: "", twitter: "", instagram: "", whatsapp: "",
    experience_years: "", completed_projects: "", certificates_count: "",
    cv_url_id: "", cv_url_en: "", logo_text: "",
  });

  useEffect(() => {
    if (data) {
      const sl = (data.social_links ?? {}) as any;
      setForm({
        full_name: data.full_name ?? "", title: data.title ?? "", bio: data.bio ?? "",
        email: data.email ?? "", location: data.location ?? "", avatar_url: data.avatar_url ?? "",
        linkedin: sl.linkedin ?? "", github: sl.github ?? "", twitter: sl.twitter ?? "",
        instagram: sl.instagram ?? "", whatsapp: sl.whatsapp ?? "",
        experience_years: sl.experience_years ?? "",
        completed_projects: sl.completed_projects ?? "",
        certificates_count: sl.certificates_count ?? "",
        cv_url_id: sl.cv_url_id ?? "",
        cv_url_en: sl.cv_url_en ?? "",
        logo_text: sl.logo_text ?? "",
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("Profile belum ada");
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name,
        title: form.title,
        bio: form.bio,
        email: form.email,
        location: form.location,
        avatar_url: form.avatar_url || null,
        social_links: { 
          linkedin: form.linkedin, 
          github: form.github, 
          twitter: form.twitter,
          instagram: form.instagram,
          whatsapp: form.whatsapp,
          experience_years: form.experience_years,
          completed_projects: form.completed_projects,
          certificates_count: form.certificates_count,
          cv_url_id: form.cv_url_id,
          cv_url_en: form.cv_url_en,
          logo_text: form.logo_text,
        },
        updated_at: new Date().toISOString(),
      }).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profil disimpan");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Profil</h1>
      <p className="text-muted-foreground mb-8">Informasi pribadi yang ditampilkan di portfolio.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
        className="space-y-4 max-w-2xl"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Lengkap" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Field label="Teks Logo Navbar (Contoh: Anjar Abidin)" value={form.logo_text} onChange={(v) => setForm({ ...form, logo_text: v })} />
        </div>
        <Field label="Jabatan / Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <div>
          <Label>Bio</Label>
          <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Lokasi" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        </div>
        <div className="pt-2">
          <Label className="mb-2 block">Foto Profil</Label>
          <ImageUpload value={form.avatar_url || null} onChange={(url) => setForm({ ...form, avatar_url: url ?? "" })} label="Unggah Foto Profil" />
        </div>

        {/* Berkas CV PDF Section */}
        <div className="pt-6 border-t border-border/40 space-y-4">
          <h3 className="font-display text-lg text-primary">Berkas CV (PDF)</h3>
          <p className="text-xs text-muted-foreground">Unggah berkas CV Anda dalam format PDF untuk versi Bahasa Indonesia dan Bahasa Inggris.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block font-medium">CV Versi Bahasa Indonesia</Label>
              <PdfUpload value={form.cv_url_id || null} onChange={(url) => setForm({ ...form, cv_url_id: url ?? "" })} label="Unggah CV PDF (Bahasa Indonesia)" />
            </div>
            <div>
              <Label className="mb-2 block font-medium">CV Versi Bahasa Inggris</Label>
              <PdfUpload value={form.cv_url_en || null} onChange={(url) => setForm({ ...form, cv_url_en: url ?? "" })} label="Unggah CV PDF (English)" />
            </div>
          </div>
        </div>

        {/* Custom Stats Fields */}
        <div className="pt-6 border-t border-border/40 space-y-3">
          <h3 className="font-display text-lg text-primary">Kustomisasi Statistik (Opsional)</h3>
          <p className="text-xs text-muted-foreground">Kosongkan jika ingin sistem menghitung otomatis dari riwayat pekerjaan, proyek, dan sertifikat yang Anda unggah.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Tahun Pengalaman (Contoh: 5)" type="number" value={form.experience_years} onChange={(v) => setForm({ ...form, experience_years: v })} />
            <Field label="Proyek Selesai (Contoh: 12)" type="number" value={form.completed_projects} onChange={(v) => setForm({ ...form, completed_projects: v })} />
            <Field label="Sertifikat (Contoh: 13)" type="number" value={form.certificates_count} onChange={(v) => setForm({ ...form, certificates_count: v })} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-border/40">
          <Field label="LinkedIn URL" value={form.linkedin} onChange={(v) => setForm({ ...form, linkedin: v })} />
          <Field label="GitHub URL" value={form.github} onChange={(v) => setForm({ ...form, github: v })} />
          <Field label="Twitter URL" value={form.twitter} onChange={(v) => setForm({ ...form, twitter: v })} />
          <Field label="Instagram URL" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} />
          <Field label="WhatsApp URL" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
        </div>
        <Button type="submit" disabled={save.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {save.isPending ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}