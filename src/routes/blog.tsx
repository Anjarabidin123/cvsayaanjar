import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

const SITE = "https://cvsayaanjar.lovable.app";

export const Route = createFileRoute("/blog")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Blog — Catatan & Artikel | CV Nusantara" },
      { name: "description", content: "Tulisan, catatan teknis, dan refleksi tentang pengembangan web, karier developer, dan perjalanan belajar." },
      { property: "og:title", content: "Blog — CV Nusantara" },
      { property: "og:description", content: "Tulisan dan catatan teknis seputar pengembangan web." },
      { property: "og:url", content: `${SITE}/blog` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/blog` }],
  }),
});

async function fetchPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, cover_url, tags, published_at, reading_minutes")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

function BlogIndex() {
  const { lang } = useI18n();
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts-public"], queryFn: fetchPosts });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40">
        <div className="max-w-5xl mx-auto px-5 md:px-6 py-5 md:py-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> {lang === "id" ? "Beranda" : "Home"}
          </Link>
          <span className="font-display text-lg"><span className="text-primary">◆</span> Blog</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-6 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">{lang === "id" ? "Catatan & Artikel" : "Notes & Articles"}</p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight">
            {lang === "id" ? "Tulisan & " : "Writings & "}<span className="text-primary italic">{lang === "id" ? "refleksi" : "reflections"}</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            {lang === "id"
              ? "Catatan teknis, opini, dan refleksi perjalanan saya membangun produk digital."
              : "Technical notes, opinions, and reflections from my journey building digital products."}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-muted/40 animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground italic">
            {lang === "id" ? "Belum ada artikel." : "No articles yet."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {posts.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block border border-border/60 bg-card hover:border-primary/60 transition-all duration-300 h-full">
                  {p.cover_url ? (
                    <div className="aspect-[16/10] overflow-hidden bg-muted/30">
                      <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center">
                      <span className="font-display text-5xl text-primary/30">◆</span>
                    </div>
                  )}
                  <div className="p-5 md:p-6">
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">{t}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-xl md:text-2xl leading-snug mb-2 group-hover:text-primary transition-colors">{p.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {p.published_at && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                            {new Date(p.published_at).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.reading_minutes} min</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 mt-16">
        <div className="max-w-5xl mx-auto px-5 md:px-6 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} · CV Nusantara
        </div>
      </footer>
    </div>
  );
}
