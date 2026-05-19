import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export const Route = createFileRoute("/admin/posts")({
  component: PostsAdmin,
});

type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  reading_minutes: number;
  display_order: number;
};

const empty: Post = {
  slug: "", title: "", excerpt: "", content: "", cover_url: null,
  tags: [], is_published: false, published_at: null, reading_minutes: 3, display_order: 0,
};

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function PostsAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["posts-admin"],
    queryFn: async () => (await supabase.from("posts").select("*").order("display_order")).data ?? [],
  });
  const [draft, setDraft] = useState<Post>(empty);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["posts-admin"] });
    qc.invalidateQueries({ queryKey: ["posts-public"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!draft.slug) draft.slug = slugify(draft.title);
      const payload = { ...draft, published_at: draft.is_published && !draft.published_at ? new Date().toISOString() : draft.published_at };
      const { error } = await supabase.from("posts").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Artikel ditambahkan"); setDraft(empty); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const update = useMutation({
    mutationFn: async (p: Post) => {
      const { id, ...rest } = p;
      const payload = { ...rest, published_at: rest.is_published && !rest.published_at ? new Date().toISOString() : rest.published_at };
      const { error } = await supabase.from("posts").update(payload).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tersimpan"); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Dihapus"); refresh(); },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Blog / Artikel</h1>
      <p className="text-muted-foreground mb-8">Kelola artikel blog. Mendukung Markdown (heading, list, code block, table).</p>

      <section className="border border-border/60 bg-card p-6 mb-8">
        <h2 className="font-display text-2xl mb-4 text-primary">Tambah Artikel</h2>
        <PostForm value={draft} onChange={setDraft} />
        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => create.mutate()} disabled={create.isPending || !draft.title}>
          <Plus className="w-4 h-4 mr-2" /> Tambah
        </Button>
      </section>

      <div className="space-y-4">
        {items.map((it) => (
          <PostEditCard key={it.id} item={it as Post} onSave={(v) => update.mutate(v)} onDelete={() => remove.mutate(it.id)} />
        ))}
      </div>
    </div>
  );
}

function PostForm({ value, onChange }: { value: Post; onChange: (v: Post) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Judul</Label>
          <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value, slug: value.slug || slugify(e.target.value) })} />
        </div>
        <div>
          <Label>Slug (URL)</Label>
          <Input value={value.slug} onChange={(e) => onChange({ ...value, slug: slugify(e.target.value) })} placeholder="cara-belajar-react" />
        </div>
      </div>
      <div>
        <Label>Ringkasan (excerpt)</Label>
        <Textarea rows={2} value={value.excerpt} onChange={(e) => onChange({ ...value, excerpt: e.target.value })} />
      </div>
      <div>
        <Label>Gambar Cover</Label>
        <ImageUpload value={value.cover_url} onChange={(url) => onChange({ ...value, cover_url: url })} label="Pilih Cover" />
      </div>
      <div>
        <Label>Isi (Markdown)</Label>
        <Textarea rows={14} value={value.content} onChange={(e) => onChange({ ...value, content: e.target.value })} className="font-mono text-sm" placeholder="# Judul..." />
      </div>
      <div className="grid sm:grid-cols-4 gap-4">
        <div>
          <Label>Tag (pisah koma)</Label>
          <Input value={value.tags.join(", ")} onChange={(e) => onChange({ ...value, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
        </div>
        <div>
          <Label>Menit baca</Label>
          <Input type="number" min={1} value={value.reading_minutes} onChange={(e) => onChange({ ...value, reading_minutes: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Urutan</Label>
          <Input type="number" value={value.display_order} onChange={(e) => onChange({ ...value, display_order: Number(e.target.value) })} />
        </div>
        <div className="flex items-end">
          <Button type="button" variant={value.is_published ? "default" : "outline"} onClick={() => onChange({ ...value, is_published: !value.is_published })} className="w-full">
            {value.is_published ? <><Eye className="w-4 h-4 mr-2" />Diterbitkan</> : <><EyeOff className="w-4 h-4 mr-2" />Draft</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PostEditCard({ item, onSave, onDelete }: { item: Post; onSave: (v: Post) => void; onDelete: () => void }) {
  const [v, setV] = useState(item);
  return (
    <div className="border border-border/60 bg-card p-6">
      <PostForm value={v} onChange={setV} />
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => onSave(v)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-4 h-4 mr-2" />Simpan</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-2" />Hapus</Button>
      </div>
    </div>
  );
}
