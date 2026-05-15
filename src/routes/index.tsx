import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail, MapPin, ExternalLink, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Curriculum Vitae" },
      { name: "description", content: "Portfolio profesional menampilkan pengalaman, proyek, dan keahlian." },
    ],
  }),
  component: HomePage,
});

type SocialLinks = { linkedin?: string; github?: string; twitter?: string };

async function fetchPortfolio() {
  const [profile, experiences, projects, skills] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).maybeSingle(),
    supabase.from("experiences").select("*").order("display_order"),
    supabase.from("projects").select("*").order("display_order"),
    supabase.from("skills").select("*").order("display_order"),
  ]);
  return {
    profile: profile.data,
    experiences: experiences.data ?? [],
    projects: projects.data ?? [],
    skills: skills.data ?? [],
  };
}

function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ["portfolio"], queryFn: fetchPortfolio });

  if (isLoading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  }

  const { profile, experiences, projects, skills } = data;
  const social = (profile?.social_links ?? {}) as SocialLinks;

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/60 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-wider">
            <span className="text-primary">◆</span> {profile?.full_name?.split(" ")[0] ?? "CV"}
          </Link>
          <nav className="hidden md:flex gap-8 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">Tentang</a>
            <a href="#experience" className="hover:text-primary transition-colors">Pengalaman</a>
            <a href="#projects" className="hover:text-primary transition-colors">Proyek</a>
            <a href="#skills" className="hover:text-primary transition-colors">Skill</a>
            <a href="#contact" className="hover:text-primary transition-colors">Kontak</a>
          </nav>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="about" className="pt-40 pb-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-8"
          >
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-6">Curriculum Vitae</p>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.95] mb-8">
              {profile?.full_name}
              <span className="block italic text-primary">— {profile?.title}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{profile?.bio}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-4 space-y-3 text-sm border-l border-primary/30 pl-6"
          >
            {profile?.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" /> {profile.location}
              </div>
            )}
            {profile?.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" /> {profile.email}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Github className="w-5 h-5" /></a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin className="w-5 h-5" /></a>}
              {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Twitter className="w-5 h-5" /></a>}
            </div>
          </motion.div>
        </div>
      </section>

      <Divider label="01 — Pengalaman" />

      {/* Experience */}
      <section id="experience" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="grid md:grid-cols-12 gap-6 pb-12 border-b border-border/40"
              >
                <div className="md:col-span-3 text-sm text-muted-foreground tracking-wider">
                  {formatYear(exp.start_date)} — {exp.end_date ? formatYear(exp.end_date) : "Sekarang"}
                </div>
                <div className="md:col-span-9">
                  <h3 className="font-display text-3xl mb-1">{exp.role}</h3>
                  <p className="text-primary mb-3 italic">{exp.company}</p>
                  <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider label="02 — Proyek Pilihan" />

      {/* Projects */}
      <section id="projects" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-card border border-border/50 hover:border-primary/40 transition-all p-8 flex flex-col"
            >
              {p.image_url && (
                <div className="aspect-video mb-6 overflow-hidden bg-secondary">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-display text-2xl">{p.title}</h3>
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noreferrer" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.technologies.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 border border-primary/30 text-primary tracking-wide">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 text-xs uppercase tracking-wider">
                {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Demo</a>}
                {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"><Github className="w-3 h-3" /> Repo</a>}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Divider label="03 — Keahlian" />

      {/* Skills */}
      <section id="skills" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {Object.entries(skillsByCategory).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="font-display text-2xl text-primary mb-6">{cat}</h3>
              <div className="space-y-4">
                {items.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.proficiency}%</span>
                    </div>
                    <div className="h-px bg-border/60">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-px bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-32 px-6 border-t border-border/40 mt-24">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm tracking-[0.3em] text-primary uppercase mb-6">Mari Berkolaborasi</p>
          <h2 className="font-display text-5xl md:text-7xl mb-8">{profile?.email}</h2>
          <a
            href={`mailto:${profile?.email}`}
            className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-wider uppercase"
          >
            Hubungi Saya <ArrowUpRight className="w-4 h-4" />
          </a>
          <p className="text-xs text-muted-foreground mt-16">© {new Date().getFullYear()} {profile?.full_name}</p>
        </div>
      </footer>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex items-center gap-4">
        <span className="text-xs tracking-[0.3em] text-primary uppercase">{label}</span>
        <div className="flex-1 h-px bg-border/60" />
      </div>
    </div>
  );
}

function formatYear(d: string) {
  return new Date(d).getFullYear().toString();
}