import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Save, Star } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export const Route = createFileRoute("/admin/testimonials")({
  component: TestimonialsAdmin,
});

type Testimonial = {
  id?: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  display_order: number;
};

const empty: Testimonial = {
  name: "",
  role: "",
  company: "",
  quote: "",
  rating: 5,
  avatar_url: null,
  display_order: 0,
};

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["testimonials-admin"],
    queryFn: async () =>
      (await supabase.from("testimonials").select("*").order("display_order")).data ?? [],
  });

  const [draft, setDraft] = useState<Testimonial>(empty);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["testimonials-admin"] });
    qc.invalidateQueries({ queryKey: ["portfolio"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        name: draft.name,
        role: draft.role || "",
        company: draft.company || "",
        quote: draft.quote || "",
        rating: draft.rating,
        avatar_url: draft.avatar_url,
        display_order: draft.display_order,
      };
      const { error } = await supabase.from("testimonials").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Testimoni ditambahkan");
      setDraft(empty);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const update = useMutation({
    mutationFn: async (t: Testimonial) => {
      const { id, ...r } = t;
      const { error } = await supabase.from("testimonials").update(r).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dihapus");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Testimoni</h1>
      <p className="text-muted-foreground mb-8">Kelola ulasan dan rekomendasi dari klien atau rekan kerja.</p>

      <section className="border border-border/60 bg-card p-6 mb-8">
        <h2 className="font-display text-2xl mb-4 text-primary">Tambah Testimoni</h2>
        <TestimonialForm value={draft} onChange={setDraft} />
        <Button
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => create.mutate()}
          disabled={create.isPending || !draft.name}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Testimoni
        </Button>
      </section>

      <div className="space-y-4">
        {items.map((it) => (
          <TestimonialRow
            key={it.id}
            item={it as Testimonial}
            onSave={(v) => update.mutate(v)}
            onDelete={() => remove.mutate(it.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialForm({ value, onChange }: { value: Testimonial; onChange: (v: Testimonial) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label>Nama Lengkap *</Label>
        <Input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="John Doe"
          required
        />
      </div>
      <div>
        <Label>Jabatan / Peran</Label>
        <Input
          value={value.role}
          onChange={(e) => onChange({ ...value, role: e.target.value })}
          placeholder="CEO, Manager, Senior Dev"
        />
      </div>
      <div>
        <Label>Perusahaan</Label>
        <Input
          value={value.company}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
          placeholder="PT Maju Bersama"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Rating Bintang (1-5)</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={value.rating}
            onChange={(e) => onChange({ ...value, rating: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Bintang
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Urutan Tampilan</Label>
          <Input
            type="number"
            value={value.display_order}
            onChange={(e) => onChange({ ...value, display_order: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <Label>Isi Testimoni / Ulasan</Label>
        <Textarea
          rows={3}
          value={value.quote}
          onChange={(e) => onChange({ ...value, quote: e.target.value })}
          placeholder="Ketik ulasan di sini..."
        />
      </div>
      <div className="sm:col-span-2">
        <Label className="mb-2 block">Foto Profil Pengulas</Label>
        <ImageUpload
          value={value.avatar_url}
          onChange={(url) => onChange({ ...value, avatar_url: url })}
          label="Unggah Foto Pengulas"
        />
      </div>
    </div>
  );
}

function TestimonialRow({
  item,
  onSave,
  onDelete,
}: {
  item: Testimonial;
  onSave: (v: Testimonial) => void;
  onDelete: () => void;
}) {
  const [v, setV] = useState(item);
  return (
    <div className="border border-border/60 bg-card p-6 rounded-md">
      <TestimonialForm value={v} onChange={setV} />
      <div className="flex gap-2 mt-4 justify-between items-center border-t border-border/40 pt-4">
        <div className="flex gap-1">
          {Array.from({ length: v.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onSave(v)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!v.name}
          >
            <Save className="w-4 h-4 mr-2" /> Simpan
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
