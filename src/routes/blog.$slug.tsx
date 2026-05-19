import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

const SITE = "https://cvsayaanjar.lovable.app";

async function fetchPost(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
  return data;
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => fetchPost(params.slug),
  head: ({ params, loaderData }) => {
    const post = loaderData;
    const title = post?.title ?? "Artikel";
    const description = post?.excerpt ?? "";
    const url = `${SITE}/blog/${params.slug}`;
    const meta: Array<Record<string, string>> = [
      { title: `${title} — Blog CV Nusantara` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "article" },
    ];
    if (post?.cover_url) {
      meta.push({ property: "og:image", content: post.cover_url });
      meta.push({ name: "twitter:image", content: post.cover_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          image: post?.cover_url ?? undefined,
          datePublished: post?.published_at ?? undefined,
          dateModified: post?.updated_at ?? undefined,
        }),
      }],
    };
  },
  component: BlogPost,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-5xl mb-3">404</h1>
        <p className="text-muted-foreground mb-6">Artikel tidak ditemukan.</p>
        <Link to="/blog" className="text-primary underline">Kembali ke daftar artikel</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Link to="/blog" className="text-primary underline">Kembali</Link>
      </div>
    </div>
  ),
});

function BlogPost() {
  const { lang } = useI18n();
  const initial = Route.useLoaderData();
  const { data: post = initial } = useQuery({
    queryKey: ["post", initial.slug],
    queryFn: () => fetchPost(initial.slug),
    initialData: initial,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40">
        <div className="max-w-3xl mx-auto px-5 md:px-6 py-5 flex items-center justify-between">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">CV</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 md:px-6 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">{t}</span>
              ))}
            </div>
          )}
          <h1 className="font-display text-3xl md:text-5xl leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-b border-border/40 pb-6 mb-8">
            {post.published_at && (
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
                {new Date(post.published_at).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.reading_minutes} min baca</span>
          </div>

          {post.cover_url && (
            <img src={post.cover_url} alt={post.title} className="w-full rounded-lg mb-8" />
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-code:text-accent prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/40">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </motion.div>
      </article>

      <footer className="border-t border-border/40 mt-16">
        <div className="max-w-3xl mx-auto px-5 md:px-6 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} · CV Nusantara
        </div>
      </footer>
    </div>
  );
}
