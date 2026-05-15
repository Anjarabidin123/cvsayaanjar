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

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsAdmin,
});

type Proj = {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  live_url: string | null;
  repo_url: string | null;
  image_url: string | null;
  display_order: number;
};

const empty: Proj = { title: "", description: "", technologies: [], live_url: "", repo_url: "", image_url: "", display_order: 0 };

function ProjectsAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["projects-admin"],
    queryFn: async () => (await supabase.from("projects").select("*").order("display_order")).data ?? [],
  });

  const [draft, setDraft] = useState<Proj>(empty);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["projects-admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").insert({
        ...draft,
        live_url: draft.live_url || null,
        repo_url: draft.repo_url || null,
        image_url: draft.image_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Proyek ditambahkan"); setDraft(empty); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const update = useMutation({
    mutationFn: async (p: Proj) => {
      const { id, ...rest } = p;
      const { error } = await supabase.from("projects").update({
        ...rest,
        live_url: rest.live_url || null,
        repo_url: rest.repo_url || null,
        image_url: rest.image_url || null,
      }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tersimpan"); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Dihapus"); refresh(); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Proyek</h1>
      <p className="text-muted-foreground mb-8">Showcase karya dan portofolio Anda.</p>

      <section className="border border-border/60 bg-card p-6 mb-8">
        <h2 className="font-display text-2xl mb-4 text-primary">Tambah Baru</h2>
        <ProjForm value={draft} onChange={setDraft} />
        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Proyek
        </Button>
      </section>

      <div className="space-y-4">
        {items.map((it) => (
          <ProjEdit key={it.id} item={it as Proj} onSave={(v) => update.mutate(v)} onDelete={() => remove.mutate(it.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjForm({ value, onChange }: { value: Proj; onChange: (v: Proj) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2"><Label>Judul</Label><Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Deskripsi</Label><Textarea rows={3} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} /></div>
      <div className="sm:col-span-2">
        <Label>Teknologi (pisahkan koma)</Label>
        <Input value={value.technologies.join(", ")} onChange={(e) => onChange({ ...value, technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
      </div>
      <div><Label>Link Demo</Label><Input value={value.live_url ?? ""} onChange={(e) => onChange({ ...value, live_url: e.target.value })} placeholder="https://..." /></div>
      <div><Label>Link Repo</Label><Input value={value.repo_url ?? ""} onChange={(e) => onChange({ ...value, repo_url: e.target.value })} placeholder="https://..." /></div>
      <div className="sm:col-span-2"><Label>URL Gambar</Label><Input value={value.image_url ?? ""} onChange={(e) => onChange({ ...value, image_url: e.target.value })} placeholder="https://..." /></div>
      <div><Label>Urutan</Label><Input type="number" value={value.display_order} onChange={(e) => onChange({ ...value, display_order: Number(e.target.value) })} /></div>
    </div>
  );
}

function ProjEdit({ item, onSave, onDelete }: { item: Proj; onSave: (v: Proj) => void; onDelete: () => void }) {
  const [v, setV] = useState(item);
  return (
    <div className="border border-border/60 bg-card p-6">
      <ProjForm value={v} onChange={setV} />
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => onSave(v)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-4 h-4 mr-2" />Simpan</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-2" />Hapus</Button>
      </div>
    </div>
  );
}