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

export const Route = createFileRoute("/admin/certificates")({
  component: CertificatesAdmin,
});

type Cert = {
  id?: string;
  name: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
  image_url: string | null;
  description: string;
  display_order: number;
};

const empty: Cert = {
  name: "",
  issuer: "",
  issue_date: null,
  credential_url: "",
  image_url: "",
  description: "",
  display_order: 0,
};

function CertificatesAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["certificates-admin"],
    queryFn: async () =>
      (await supabase.from("certificates").select("*").order("display_order")).data ?? [],
  });
  const [draft, setDraft] = useState<Cert>(empty);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["certificates-admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const payload = { ...draft, issue_date: draft.issue_date || null };
      const { error } = await supabase.from("certificates").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Sertifikat ditambahkan"); setDraft(empty); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });
  const update = useMutation({
    mutationFn: async (c: Cert) => {
      const { id, ...r } = c;
      const payload = { ...r, issue_date: r.issue_date || null };
      const { error } = await supabase.from("certificates").update(payload).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tersimpan"); refresh(); },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Dihapus"); refresh(); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Sertifikat</h1>
      <p className="text-muted-foreground mb-8">Kelola sertifikat dan pencapaian profesional.</p>

      <section className="border border-border/60 bg-card p-6 mb-8">
        <h2 className="font-display text-2xl mb-4 text-primary">Tambah Sertifikat</h2>
        <CertForm value={draft} onChange={setDraft} />
        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => create.mutate()}>
          <Plus className="w-4 h-4 mr-2" />Tambah
        </Button>
      </section>

      <div className="space-y-3">
        {items.map((it) => (
          <CertRow key={it.id} item={it as Cert} onSave={(v) => update.mutate(v)} onDelete={() => remove.mutate(it.id!)} />
        ))}
      </div>
    </div>
  );
}

function CertForm({ value, onChange }: { value: Cert; onChange: (v: Cert) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div><Label>Nama Sertifikat</Label><Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} /></div>
      <div><Label>Penerbit</Label><Input value={value.issuer} onChange={(e) => onChange({ ...value, issuer: e.target.value })} placeholder="Google, Dicoding, dll" /></div>
      <div><Label>Tanggal Terbit</Label><Input type="date" value={value.issue_date ?? ""} onChange={(e) => onChange({ ...value, issue_date: e.target.value || null })} /></div>
      <div><Label>Urutan</Label><Input type="number" value={value.display_order} onChange={(e) => onChange({ ...value, display_order: Number(e.target.value) })} /></div>
      <div><Label>URL Kredensial</Label><Input value={value.credential_url ?? ""} onChange={(e) => onChange({ ...value, credential_url: e.target.value })} placeholder="https://..." /></div>
      <div>
        <Label className="mb-2 block">Gambar Sertifikat</Label>
        <ImageUpload value={value.image_url} onChange={(url) => onChange({ ...value, image_url: url })} label="Unggah Sertifikat" />
      </div>
      <div className="sm:col-span-2"><Label>Deskripsi</Label><Textarea rows={2} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} /></div>
    </div>
  );
}

function CertRow({ item, onSave, onDelete }: { item: Cert; onSave: (v: Cert) => void; onDelete: () => void }) {
  const [v, setV] = useState(item);
  return (
    <div className="border border-border/60 bg-card p-4">
      <CertForm value={v} onChange={setV} />
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={() => onSave(v)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-4 h-4 mr-1" />Simpan</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" />Hapus</Button>
      </div>
    </div>
  );
}
