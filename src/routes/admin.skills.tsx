import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/admin/skills")({
  component: SkillsAdmin,
});

type Skill = { id?: string; category: string; name: string; proficiency: number; display_order: number };
const empty: Skill = { category: "", name: "", proficiency: 80, display_order: 0 };

function SkillsAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["skills-admin"],
    queryFn: async () => (await supabase.from("skills").select("*").order("display_order")).data ?? [],
  });
  const [draft, setDraft] = useState<Skill>(empty);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["skills-admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const create = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("skills").insert(draft); if (error) throw error; },
    onSuccess: () => { toast.success("Ditambahkan"); setDraft(empty); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });
  const update = useMutation({
    mutationFn: async (s: Skill) => { const { id, ...r } = s; const { error } = await supabase.from("skills").update(r).eq("id", id!); if (error) throw error; },
    onSuccess: () => { toast.success("Tersimpan"); refresh(); },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("skills").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Dihapus"); refresh(); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Skill</h1>
      <p className="text-muted-foreground mb-8">Kelola keahlian dan tingkat penguasaan.</p>

      <section className="border border-border/60 bg-card p-6 mb-8">
        <h2 className="font-display text-2xl mb-4 text-primary">Tambah Skill</h2>
        <SkillForm value={draft} onChange={setDraft} />
        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => create.mutate()}>
          <Plus className="w-4 h-4 mr-2" />Tambah
        </Button>
      </section>

      <div className="space-y-3">
        {items.map((it) => (
          <SkillRow key={it.id} item={it as Skill} onSave={(v) => update.mutate(v)} onDelete={() => remove.mutate(it.id)} />
        ))}
      </div>
    </div>
  );
}

function SkillForm({ value, onChange }: { value: Skill; onChange: (v: Skill) => void }) {
  return (
    <div className="grid sm:grid-cols-4 gap-4">
      <div><Label>Kategori</Label><Input value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} placeholder="Frontend" /></div>
      <div><Label>Nama</Label><Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} /></div>
      <div><Label>Proficiency (0-100)</Label><Input type="number" min={0} max={100} value={value.proficiency} onChange={(e) => onChange({ ...value, proficiency: Number(e.target.value) })} /></div>
      <div><Label>Urutan</Label><Input type="number" value={value.display_order} onChange={(e) => onChange({ ...value, display_order: Number(e.target.value) })} /></div>
    </div>
  );
}

function SkillRow({ item, onSave, onDelete }: { item: Skill; onSave: (v: Skill) => void; onDelete: () => void }) {
  const [v, setV] = useState(item);
  return (
    <div className="border border-border/60 bg-card p-4">
      <SkillForm value={v} onChange={setV} />
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={() => onSave(v)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-4 h-4 mr-1" />Simpan</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" />Hapus</Button>
      </div>
    </div>
  );
}