import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
    linkedin: "", github: "", twitter: "",
  });

  useEffect(() => {
    if (data) {
      const sl = (data.social_links ?? {}) as { linkedin?: string; github?: string; twitter?: string };
      setForm({
        full_name: data.full_name ?? "", title: data.title ?? "", bio: data.bio ?? "",
        email: data.email ?? "", location: data.location ?? "", avatar_url: data.avatar_url ?? "",
        linkedin: sl.linkedin ?? "", github: sl.github ?? "", twitter: sl.twitter ?? "",
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
        social_links: { linkedin: form.linkedin, github: form.github, twitter: form.twitter },
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
        <Field label="Nama Lengkap" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
        <Field label="Jabatan / Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <div>
          <Label>Bio</Label>
          <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Lokasi" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        </div>
        <Field label="URL Foto Profil" value={form.avatar_url} onChange={(v) => setForm({ ...form, avatar_url: v })} />
        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
          <Field label="LinkedIn URL" value={form.linkedin} onChange={(v) => setForm({ ...form, linkedin: v })} />
          <Field label="GitHub URL" value={form.github} onChange={(v) => setForm({ ...form, github: v })} />
          <Field label="Twitter URL" value={form.twitter} onChange={(v) => setForm({ ...form, twitter: v })} />
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