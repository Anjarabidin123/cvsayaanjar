import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  ArrowUpRight, Github, Linkedin, Mail, MapPin, ExternalLink, Twitter,
  Award, GraduationCap, Quote, Star, Download, Globe, Send, MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NusantaraPattern, NusantaraGlyph, GununganOrnament, SulurDivider } from "@/components/NusantaraOrnament";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Curriculum Vitae Nusantara" },
      { name: "description", content: "Portfolio profesional bercitarasa Indonesia — pengalaman, pendidikan, proyek, sertifikat, dan testimoni." },
    ],
  }),
  component: HomePage,
});

type SocialLinks = { linkedin?: string; github?: string; twitter?: string; whatsapp?: string };

async function fetchPortfolio() {
  const [profile, experiences, education, projects, skills, certificates, testimonials] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).maybeSingle(),
    supabase.from("experiences").select("*").order("display_order"),
    supabase.from("education").select("*").order("display_order"),
    supabase.from("projects").select("*").order("display_order"),
    supabase.from("skills").select("*").order("display_order"),
    supabase.from("certificates").select("*").order("display_order"),
    supabase.from("testimonials").select("*").order("display_order"),
  ]);
  return {
    profile: profile.data,
    experiences: experiences.data ?? [],
    education: education.data ?? [],
    projects: projects.data ?? [],
    skills: skills.data ?? [],
    certificates: certificates.data ?? [],
    testimonials: testimonials.data ?? [],
  };
}

function HomePage() {
  const { t, lang, setLang } = useI18n();
  const { data, isLoading } = useQuery({ queryKey: ["portfolio"], queryFn: fetchPortfolio });

  if (isLoading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("loading")}</div>;
  }

  const { profile, experiences, education, projects, skills, certificates, testimonials } = data;
  const social = (profile?.social_links ?? {}) as SocialLinks;

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const yearsExp = (() => {
    if (!experiences.length) return 0;
    const earliest = experiences.reduce((min, e) => {
      const y = new Date(e.start_date).getFullYear();
      return y < min ? y : min;
    }, new Date().getFullYear());
    return new Date().getFullYear() - earliest;
  })();

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Latar tenun halus */}
      <div className="pointer-events-none fixed inset-0 -z-10 no-print">
        <div className="absolute inset-0 text-primary">
          <NusantaraPattern variant="tenun" opacity={0.05} />
        </div>
      </div>

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/85 border-b border-border no-print">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
            <NusantaraGlyph className="w-5 h-5 text-accent" />
            <span>{profile?.full_name?.split(" ")[0] ?? "CV"}</span>
          </Link>
          <nav className="hidden lg:flex gap-7 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">{t("nav_about")}</a>
            <a href="#experience" className="hover:text-primary transition-colors">{t("nav_experience")}</a>
            <a href="#education" className="hover:text-primary transition-colors">{t("nav_education")}</a>
            <a href="#projects" className="hover:text-primary transition-colors">{t("nav_projects")}</a>
            <a href="#skills" className="hover:text-primary transition-colors">{t("nav_skills")}</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">{t("nav_testimonials")}</a>
            <a href="#contact" className="hover:text-primary transition-colors">{t("nav_contact")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "id" ? "en" : "id")}
              className="text-xs px-2 py-1 border border-border hover:border-primary rounded-full inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-3 h-3" /> {lang.toUpperCase()}
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-full"
            >
              <Download className="w-3.5 h-3.5" /> {t("download_cv")}
            </button>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t("admin")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="about" className="relative pt-32 pb-20 px-6">
        <div className="pointer-events-none absolute top-20 right-0 w-[420px] h-[420px] text-accent opacity-60">
          <NusantaraPattern variant="kawung-mini" opacity={0.18} />
        </div>
        <GununganOrnament className="pointer-events-none absolute top-24 right-8 w-24 h-36 text-accent/40 hidden md:block" />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-12 gap-10 items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-8"
          >
            <p className="text-xs tracking-[0.3em] text-accent uppercase mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-accent/60" /> {t("hero_kicker")}
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] mb-6 text-primary">
              {profile?.full_name}
              <span className="block italic text-accent mt-1">— {profile?.title}</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">{profile?.bio}</p>
            <p className="mt-5 font-display italic text-primary/70 text-base">"{t("hero_quote")}"</p>

            {/* Stats counter */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              <Stat value={yearsExp} label={t("stat_experience")} />
              <Stat value={projects.length} label={t("stat_projects")} />
              <Stat value={certificates.length} label={t("stat_certificates")} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-4 space-y-3 text-sm border-l-2 border-accent/60 pl-6 relative"
          >
            <div className="absolute -left-[5px] top-0 w-2 h-2 rotate-45 bg-accent" />
            <div className="absolute -left-[5px] bottom-0 w-2 h-2 rotate-45 bg-accent" />
            {profile?.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent" /> {profile.location}
              </div>
            )}
            {profile?.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-accent" /> {profile.email}
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

      <Divider label={t("section_experience")} />

      {/* Experience */}
      <section id="experience" className="relative py-20 px-6">
        <div className="relative max-w-6xl mx-auto space-y-10">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="grid md:grid-cols-12 gap-6 pb-10 border-b border-border"
            >
              <div className="md:col-span-3 text-sm text-muted-foreground tracking-wider">
                {formatYear(exp.start_date)} — {exp.end_date ? formatYear(exp.end_date) : t("present")}
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-2xl md:text-3xl mb-1 text-primary">{exp.role}</h3>
                <p className="text-accent mb-3 italic">{exp.company}</p>
                <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Divider label={t("section_education")} />

      {/* Education */}
      <section id="education" className="relative py-20 px-6">
        <div className="relative max-w-6xl mx-auto">
          {education.length === 0 ? (
            <p className="text-muted-foreground italic text-center">{t("no_education")}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {education.map((ed, i) => (
                <motion.article
                  key={ed.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-card border border-border p-6 rounded-sm hover:border-accent/60 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <GraduationCap className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-primary leading-tight">{ed.institution}</h3>
                      <p className="text-sm text-accent italic mt-1">{[ed.degree, ed.field].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {ed.start_year ?? "—"} — {ed.end_year ?? t("present")}
                  </div>
                  {ed.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{ed.description}</p>
                  )}
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Divider label={t("section_projects")} />

      {/* Projects */}
      <section id="projects" className="relative py-20 px-6">
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative bg-card border border-border hover:border-accent transition-all p-6 flex flex-col overflow-hidden rounded-sm"
            >
              {p.image_url && (
                <div className="relative aspect-video mb-5 overflow-hidden bg-muted rounded-sm">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-display text-2xl text-primary">{p.title}</h3>
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noreferrer" className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-5 flex-1 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.technologies.map((tech) => (
                  <span key={tech} className="text-xs px-2.5 py-1 bg-accent/10 text-primary border border-accent/30 tracking-wide rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 text-xs uppercase tracking-wider">
                {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-primary hover:text-accent inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Demo</a>}
                {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent inline-flex items-center gap-1"><Github className="w-3 h-3" /> Repo</a>}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Divider label={t("section_skills")} />

      {/* Skills */}
      <section id="skills" className="relative py-20 px-6">
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {Object.entries(skillsByCategory).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="font-display text-2xl text-accent mb-5">{cat}</h3>
              <div className="space-y-4">
                {items.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-primary">{s.name}</span>
                      <span className="text-muted-foreground">{s.proficiency}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider label={t("section_certificates")} />

      {/* Certificates */}
      <section id="certificates" className="relative py-20 px-6">
        <div className="relative max-w-6xl mx-auto">
          {certificates.length === 0 ? (
            <p className="text-muted-foreground italic text-center">{t("no_certificates")}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((c, i) => (
                <motion.article
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group bg-card border border-border hover:border-accent transition-all overflow-hidden flex flex-col rounded-sm"
                >
                  {c.image_url ? (
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center bg-muted text-accent/70">
                      <Award className="w-14 h-14" strokeWidth={1} />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <Award className="w-4 h-4 text-accent mt-1 shrink-0" />
                      <h3 className="font-display text-lg leading-tight text-primary">{c.name}</h3>
                    </div>
                    <p className="text-accent text-sm italic mb-3">{c.issuer}</p>
                    {c.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{c.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider mt-auto pt-3 border-t border-border">
                      <span>{c.issue_date ? formatMonthYear(c.issue_date, lang) : "—"}</span>
                      {c.credential_url && (
                        <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
                          {lang === "id" ? "Lihat" : "View"} <ExternalLink className="w-3 h-3" />
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

      <Divider label={t("section_testimonials")} />

      {/* Testimonials */}
      <section id="testimonials" className="relative py-20 px-6">
        <div className="relative max-w-6xl mx-auto">
          {testimonials.length === 0 ? (
            <p className="text-muted-foreground italic text-center">{t("no_testimonials")}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((tm, i) => (
                <motion.article
                  key={tm.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="relative bg-card border border-border p-6 rounded-sm hover:border-accent/60 transition-colors"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/20" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: tm.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-primary/90 leading-relaxed italic mb-5 font-display text-lg">"{tm.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {tm.avatar_url ? (
                      <img src={tm.avatar_url} alt={tm.name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-accent/15 text-accent flex items-center justify-center font-display text-lg">
                        {tm.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-primary text-sm">{tm.name}</p>
                      <p className="text-xs text-muted-foreground">{[tm.role, tm.company].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Divider label={t("section_contact")} />

      {/* Contact */}
      <section id="contact" className="relative py-20 px-6">
        <div className="relative max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-4xl text-primary mb-4">{t("contact_me")}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">{t("contact_intro")}</p>
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="block text-accent hover:underline mb-2">
                <Mail className="inline w-4 h-4 mr-2" />{profile.email}
              </a>
            )}
            {profile?.location && (
              <p className="text-muted-foreground text-sm"><MapPin className="inline w-4 h-4 mr-2 text-accent" />{profile.location}</p>
            )}
            <div className="flex gap-3 mt-6">
              {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent"><Github className="w-5 h-5" /></a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent"><Linkedin className="w-5 h-5" /></a>}
              {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent"><Twitter className="w-5 h-5" /></a>}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-border mt-10 overflow-hidden">
        <GununganOrnament className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-48 text-accent/20" />
        <div className="relative max-w-6xl mx-auto text-center">
          <SulurDivider className="w-48 h-5 mx-auto text-accent/50 mb-4" />
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <NusantaraGlyph className="w-4 h-4 text-accent/70" />
            <span>© {new Date().getFullYear()} {profile?.full_name} · {t("footer_made")}</span>
            <NusantaraGlyph className="w-4 h-4 text-accent/70" />
          </div>
        </div>
      </footer>

      {/* Floating action — WhatsApp / LinkedIn */}
      {(social.whatsapp || social.linkedin) && (
        <a
          href={social.whatsapp || social.linkedin}
          target="_blank"
          rel="noreferrer"
          className="no-print fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Quick contact"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}

/* ---------- sub components ---------- */

function Stat({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setN(Math.floor(p * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <div ref={ref}>
      <div className="font-display text-4xl text-accent">{n}+</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="max-w-6xl mx-auto px-6 no-print">
      <div className="flex items-center gap-4">
        <NusantaraGlyph className="w-4 h-4 text-accent" />
        <span className="text-xs tracking-[0.3em] text-accent uppercase">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-accent/40 to-transparent" />
      </div>
    </div>
  );
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(2000),
});

function ContactForm() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const send = useMutation({
    mutationFn: async () => {
      const parsed = contactSchema.parse(form);
      const { error } = await supabase.from("messages").insert({
        name: parsed.name,
        email: parsed.email,
        subject: parsed.subject ?? "",
        message: parsed.message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("form_success"));
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: (e) => {
      const msg = e instanceof z.ZodError ? e.issues[0]?.message : e instanceof Error ? e.message : t("form_error");
      toast.error(msg || t("form_error"));
    },
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); send.mutate(); }}
      className="bg-card border border-border p-6 rounded-sm space-y-3"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <Input placeholder={t("form_name")} value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input type="email" placeholder={t("form_email")} value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </div>
      <Input placeholder={t("form_subject")} value={form.subject} maxLength={200} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      <Textarea placeholder={t("form_message")} rows={5} value={form.message} maxLength={2000} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
      <Button type="submit" disabled={send.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        <Send className="w-4 h-4 mr-2" />
        {send.isPending ? t("form_sending") : t("form_send")}
      </Button>
    </form>
  );
}

function formatYear(d: string) {
  return new Date(d).getFullYear().toString();
}
function formatMonthYear(d: string, lang: "id" | "en") {
  return new Date(d).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short", year: "numeric" });
}