import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export const Route = createFileRoute("/admin/education")({ component: EducationAdmin });

type Edu = {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number | null;
  end_year: number | null;
  description: string;
  display_order: number;
};

const empty: Edu = { institution: "", degree: "", field: "", start_year: null, end_year: null, description: "", display_order: 0 };

function EducationAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["education-admin"],
    queryFn: async () => (await supabase.from("education").select("*").order("display_order")).data ?? [],
  });
  const [draft, setDraft] = useState<Edu>(empty);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["education-admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("education").insert(draft);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Ditambahkan"); setDraft(empty); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });
  const update = useMutation({
    mutationFn: async (v: Edu) => {
      const { id, ...rest } = v;
      const { error } = await supabase.from("education").update(rest).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tersimpan"); refresh(); },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("education").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Dihapus"); refresh(); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Pendidikan</h1>
      <p className="text-muted-foreground mb-8">Kelola riwayat pendidikan formal.</p>

      <section className="border border-border bg-card p-6 mb-8">
        <h2 className="font-display text-2xl mb-4 text-primary">Tambah Pendidikan</h2>
        <EduForm value={draft} onChange={setDraft} />
        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => create.mutate()}>
          <Plus className="w-4 h-4 mr-2" />Tambah
        </Button>
      </section>

      <div className="space-y-3">
        {items.map((it) => (
          <EduRow key={it.id} item={it as Edu} onSave={(v) => update.mutate(v)} onDelete={() => remove.mutate(it.id!)} />
        ))}
      </div>
    </div>
  );
}

function EduForm({ value, onChange }: { value: Edu; onChange: (v: Edu) => void }) {
  // Parse description
  const parseDesc = (desc: string) => {
    if (!desc) return { text: "", logo: "" };
    const parts = desc.split("||logo:");
    return { text: parts[0] || "", logo: parts[1] || "" };
  };

  const { text, logo } = parseDesc(value.description);

  const handleTextChange = (newText: string) => {
    onChange({
      ...value,
      description: newText + (logo ? `||logo:${logo}` : ""),
    });
  };

  const handleLogoChange = (newLogo: string | null) => {
    onChange({
      ...value,
      description: text + (newLogo ? `||logo:${newLogo}` : ""),
    });
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div><Label>Institusi</Label><Input value={value.institution} onChange={(e) => onChange({ ...value, institution: e.target.value })} /></div>
      <div><Label>Gelar</Label><Input value={value.degree} onChange={(e) => onChange({ ...value, degree: e.target.value })} placeholder="S1, S2, SMA, dll" /></div>
      <div><Label>Bidang / Jurusan</Label><Input value={value.field} onChange={(e) => onChange({ ...value, field: e.target.value })} /></div>
      <div><Label>Urutan</Label><Input type="number" value={value.display_order} onChange={(e) => onChange({ ...value, display_order: Number(e.target.value) })} /></div>
      <div><Label>Tahun Mulai</Label><Input type="number" value={value.start_year ?? ""} onChange={(e) => onChange({ ...value, start_year: e.target.value ? Number(e.target.value) : null })} /></div>
      <div><Label>Tahun Selesai</Label><Input type="number" value={value.end_year ?? ""} onChange={(e) => onChange({ ...value, end_year: e.target.value ? Number(e.target.value) : null })} placeholder="Kosongkan jika masih" /></div>
      <div className="sm:col-span-2">
        <Label className="mb-2 block">Logo Institusi / Sekolah</Label>
        <ImageUpload value={logo || null} onChange={handleLogoChange} label="Unggah Logo Institusi" />
      </div>
      <div className="sm:col-span-2">
        <Label>Deskripsi</Label>
        <Textarea rows={2} value={text} onChange={(e) => handleTextChange(e.target.value)} />
      </div>
    </div>
  );
}

function EduRow({ item, onSave, onDelete }: { item: Edu; onSave: (v: Edu) => void; onDelete: () => void }) {
  const [v, setV] = useState(item);
  return (
    <div className="border border-border bg-card p-4">
      <EduForm value={v} onChange={setV} />
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={() => onSave(v)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-4 h-4 mr-1" />Simpan</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" />Hapus</Button>
      </div>
    </div>
  );
}