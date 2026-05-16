import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, Mail, MapPin, ExternalLink, Twitter, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BatikPattern } from "@/components/BatikPattern";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Curriculum Vitae Nusantara" },
      { name: "description", content: "Portfolio profesional bercitarasa Indonesia — pengalaman, proyek, dan keahlian." },
    ],
  }),
  component: HomePage,
});

type SocialLinks = { linkedin?: string; github?: string; twitter?: string };

async function fetchPortfolio() {
  const [profile, experiences, projects, skills, certificates] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).maybeSingle(),
    supabase.from("experiences").select("*").order("display_order"),
    supabase.from("projects").select("*").order("display_order"),
    supabase.from("skills").select("*").order("display_order"),
    supabase.from("certificates").select("*").order("display_order"),
  ]);
  return {
    profile: profile.data,
    experiences: experiences.data ?? [],
    projects: projects.data ?? [],
    skills: skills.data ?? [],
    certificates: certificates.data ?? [],
  };
}

function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ["portfolio"], queryFn: fetchPortfolio });

  if (isLoading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  }

  const { profile, experiences, projects, skills, certificates } = data;
  const social = (profile?.social_links ?? {}) as SocialLinks;

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient batik wash */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 text-primary">
          <BatikPattern variant="kawung" opacity={0.07} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/85 to-background" />
      </div>

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/70 border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-wider flex items-center gap-2">
            <BatikGlyph className="w-5 h-5 text-primary" />
            {profile?.full_name?.split(" ")[0] ?? "CV"}
          </Link>
          <nav className="hidden md:flex gap-8 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">Tentang</a>
            <a href="#experience" className="hover:text-primary transition-colors">Pengalaman</a>
            <a href="#projects" className="hover:text-primary transition-colors">Proyek</a>
            <a href="#skills" className="hover:text-primary transition-colors">Keahlian</a>
            <a href="#certificates" className="hover:text-primary transition-colors">Sertifikat</a>
            <a href="#contact" className="hover:text-primary transition-colors">Kontak</a>
          </nav>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="about" className="relative pt-40 pb-32 px-6">
        <div className="pointer-events-none absolute top-24 right-0 w-1/2 h-[420px] text-primary">
          <BatikPattern variant="parang" opacity={0.2} />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/50 to-background" />
        </div>
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-8"
          >
            <p className="text-sm tracking-[0.3em] text-primary uppercase mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-primary/60" /> Curriculum Vitae · Nusantara
            </p>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.95] mb-8">
              {profile?.full_name}
              <span className="block italic text-primary">— {profile?.title}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{profile?.bio}</p>
            <p className="mt-6 font-display italic text-accent text-base">
              "Sedikit bicara, banyak bekerja."
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-4 space-y-3 text-sm border-l-2 border-primary/40 pl-6 relative"
          >
            <div className="absolute -left-[5px] top-0 w-2 h-2 rotate-45 bg-primary" />
            <div className="absolute -left-[5px] bottom-0 w-2 h-2 rotate-45 bg-primary" />
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
      <section id="experience" className="relative py-24 px-6">
        <div className="pointer-events-none absolute -left-20 top-10 w-72 h-72 text-accent">
          <BatikPattern variant="truntum" opacity={0.2} />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="grid md:grid-cols-12 gap-6 pb-12 border-b border-primary/15"
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
      <section id="projects" className="relative py-24 px-6">
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/60 transition-all p-8 flex flex-col overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <BatikPattern variant="kawung" opacity={0.4} />
              </div>
              {p.image_url && (
                <div className="relative aspect-video mb-6 overflow-hidden bg-secondary">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="relative flex items-start justify-between gap-4 mb-3">
                <h3 className="font-display text-2xl">{p.title}</h3>
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noreferrer" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                )}
              </div>
              <p className="relative text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">{p.description}</p>
              <div className="relative flex flex-wrap gap-2 mb-4">
                {p.technologies.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 border border-primary/30 text-primary tracking-wide">
                    {t}
                  </span>
                ))}
              </div>
              <div className="relative flex gap-4 text-xs uppercase tracking-wider">
                {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Demo</a>}
                {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"><Github className="w-3 h-3" /> Repo</a>}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Divider label="03 — Keahlian" />

      {/* Skills */}
      <section id="skills" className="relative py-24 px-6">
        <div className="pointer-events-none absolute right-0 top-0 w-1/3 h-full text-accent">
          <BatikPattern variant="parang" opacity={0.1} />
        </div>
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
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

      <Divider label="04 — Sertifikat" />

      {/* Certificates */}
      <section id="certificates" className="relative py-24 px-6">
        <div className="pointer-events-none absolute -left-10 bottom-0 w-72 h-72 text-primary">
          <BatikPattern variant="kawung" opacity={0.12} />
        </div>
        <div className="relative max-w-6xl mx-auto">
          {certificates.length === 0 ? (
            <p className="text-muted-foreground italic text-center">Belum ada sertifikat ditambahkan.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((c, i) => (
                <motion.article
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/60 transition-all overflow-hidden flex flex-col"
                >
                  {c.image_url ? (
                    <div className="aspect-[4/3] overflow-hidden bg-secondary">
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center bg-secondary/50 text-primary/60">
                      <Award className="w-16 h-16" strokeWidth={1} />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <Award className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <h3 className="font-display text-xl leading-tight">{c.name}</h3>
                    </div>
                    <p className="text-primary text-sm italic mb-3">{c.issuer}</p>
                    {c.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{c.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider mt-auto pt-3 border-t border-primary/15">
                      <span>{c.issue_date ? formatMonthYear(c.issue_date) : "—"}</span>
                      {c.credential_url && (
                        <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          Lihat <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative py-32 px-6 border-t border-primary/20 mt-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 text-primary">
          <BatikPattern variant="truntum" opacity={0.1} />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="text-sm tracking-[0.3em] text-primary uppercase mb-6">Mari Berkolaborasi · Selamat Datang</p>
          <h2 className="font-display text-5xl md:text-7xl mb-8 break-words">{profile?.email}</h2>
          <a
            href={`mailto:${profile?.email}`}
            className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-wider uppercase"
          >
            Hubungi Saya <ArrowUpRight className="w-4 h-4" />
          </a>
          <div className="mt-16 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <BatikGlyph className="w-4 h-4 text-primary/70" />
            <span>© {new Date().getFullYear()} {profile?.full_name} · Dibuat dengan rasa di Indonesia</span>
            <BatikGlyph className="w-4 h-4 text-primary/70" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex items-center gap-4">
        <BatikGlyph className="w-4 h-4 text-primary" />
        <span className="text-xs tracking-[0.3em] text-primary uppercase">{label}</span>
        <div className="flex-1 h-px bg-border/60" />
        <BatikGlyph className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
}

function BatikGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <ellipse cx="8" cy="8" rx="5" ry="3" transform="rotate(45 8 8)" />
      <ellipse cx="16" cy="16" rx="5" ry="3" transform="rotate(45 16 16)" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function formatYear(d: string) {
  return new Date(d).getFullYear().toString();
}

function formatMonthYear(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}