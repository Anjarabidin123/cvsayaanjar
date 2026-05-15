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

export const Route = createFileRoute("/admin/experiences")({
  component: ExperiencesAdmin,
});

type Exp = {
  id?: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
  display_order: number;
};

function ExperiencesAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["experiences-admin"],
    queryFn: async () => (await supabase.from("experiences").select("*").order("display_order")).data ?? [],
  });

  const [draft, setDraft] = useState<Exp>({
    company: "", role: "", start_date: "", end_date: null, description: "", display_order: 0,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["experiences-admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("experiences").insert({
        ...draft,
        end_date: draft.end_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengalaman ditambahkan");
      setDraft({ company: "", role: "", start_date: "", end_date: null, description: "", display_order: 0 });
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const update = useMutation({
    mutationFn: async (item: Exp) => {
      const { id, ...rest } = item;
      const { error } = await supabase.from("experiences").update({
        ...rest, end_date: rest.end_date || null,
      }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tersimpan"); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Dihapus"); refresh(); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Pengalaman Kerja</h1>
      <p className="text-muted-foreground mb-8">Kelola riwayat pekerjaan Anda.</p>

      <section className="border border-border/60 bg-card p-6 mb-8">
        <h2 className="font-display text-2xl mb-4 text-primary">Tambah Baru</h2>
        <ExpForm value={draft} onChange={setDraft} />
        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus className="w-4 h-4 mr-2" /> Tambah
        </Button>
      </section>

      <div className="space-y-4">
        {items.map((it) => (
          <ExpEditCard key={it.id} item={it as Exp} onSave={(v) => update.mutate(v)} onDelete={() => remove.mutate(it.id)} />
        ))}
      </div>
    </div>
  );
}

function ExpForm({ value, onChange }: { value: Exp; onChange: (v: Exp) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div><Label>Perusahaan</Label><Input value={value.company} onChange={(e) => onChange({ ...value, company: e.target.value })} /></div>
      <div><Label>Posisi</Label><Input value={value.role} onChange={(e) => onChange({ ...value, role: e.target.value })} /></div>
      <div><Label>Tanggal Mulai</Label><Input type="date" value={value.start_date} onChange={(e) => onChange({ ...value, start_date: e.target.value })} /></div>
      <div><Label>Tanggal Selesai (kosong = sekarang)</Label><Input type="date" value={value.end_date ?? ""} onChange={(e) => onChange({ ...value, end_date: e.target.value || null })} /></div>
      <div className="sm:col-span-2"><Label>Deskripsi</Label><Textarea rows={3} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} /></div>
      <div><Label>Urutan</Label><Input type="number" value={value.display_order} onChange={(e) => onChange({ ...value, display_order: Number(e.target.value) })} /></div>
    </div>
  );
}

function ExpEditCard({ item, onSave, onDelete }: { item: Exp; onSave: (v: Exp) => void; onDelete: () => void }) {
  const [v, setV] = useState(item);
  return (
    <div className="border border-border/60 bg-card p-6">
      <ExpForm value={v} onChange={setV} />
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => onSave(v)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-4 h-4 mr-2" />Simpan</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-2" />Hapus</Button>
      </div>
    </div>
  );
}