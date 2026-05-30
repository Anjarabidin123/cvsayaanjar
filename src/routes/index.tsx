import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, useInView, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";

// Lazy‑load animation components
const ParallaxBackground = lazy(() => import('@/components/ParallaxBackground'));
const TiltCard = lazy(() => import('@/components/TiltCard'));
const WaveSkillBar = lazy(() => import('@/components/WaveSkillBar'));

import { z } from "zod";
import {
  ArrowUpRight, Github, Linkedin, Mail, MapPin, ExternalLink, Twitter, Instagram,
  Award, GraduationCap, Quote, Star, Download, Globe, Send, MessageCircle,
  Moon, Sun, Menu, X, ChevronUp, ChevronLeft, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NusantaraPattern, NusantaraGlyph, GununganOrnament, SulurDivider } from "@/components/NusantaraOrnament";
import { useI18n, type DictKey } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Translate } from "@/components/Translate";
import { CertificateExplorer } from "@/components/CertificateExplorer";

// Multi‑screenshot 3D Stack/Deck image slider for featured projects
function ProjectImageSlider({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = images.length;

  // Auto-slide removed for better performance — user navigates manually

  if (total === 1) {
    return (
      <img
        src={images[0]}
        alt={title}
        loading="lazy"
        className="w-full h-full object-contain"
      />
    );
  }

  // Helper to determine the visual properties of each slide in 3D space
  const getSlideStyle = (idx: number) => {
    let diff = idx - currentIndex;
    
    // Normalize wrap-around for slider loop
    if (diff < -1) diff += total;
    if (diff > 1) diff -= total;

    // Handle 2 images case specifically
    if (total === 2 && diff === 1) {
      diff = 1;
    }

    const isActive = diff === 0;
    const isLeft = diff === -1 || (total === 2 && diff === -1);
    const isRight = diff === 1;

    if (isActive) {
      return {
        x: "0%",
        scale: 1,
        zIndex: 10,
        opacity: 1,
        rotateY: 0,
        cursor: "default",
        pointerEvents: "auto" as const,
      };
    } else if (isLeft) {
      return {
        x: "-28%",
        scale: 0.8,
        zIndex: 5,
        opacity: 0.6,
        rotateY: 20,
        cursor: "pointer",
        pointerEvents: "auto" as const,
      };
    } else if (isRight) {
      return {
        x: "28%",
        scale: 0.8,
        zIndex: 5,
        opacity: 0.6,
        rotateY: -20,
        cursor: "pointer",
        pointerEvents: "auto" as const,
      };
    } else {
      return {
        x: "0%",
        scale: 0.6,
        zIndex: 0,
        opacity: 0,
        rotateY: 0,
        cursor: "default",
        pointerEvents: "none" as const,
      };
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-full flex items-center justify-center overflow-hidden py-5" 
      style={{ perspective: "1000px" }}
    >
      {/* Sleek Floating Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + total) % total);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/70 text-white z-30 transition-all border border-white/10 shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % total);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/70 text-white z-30 transition-all border border-white/10 shadow-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      <div className="relative w-full aspect-video max-w-[82%] flex items-center justify-center">
        {images.map((img, idx) => {
          const style = getSlideStyle(idx);
          const isActive = idx === currentIndex;

          return (
            <motion.div
              key={img}
              style={{
                position: "absolute",
                width: "78%",
                height: "100%",
              }}
              animate={{
                x: style.x,
                scale: style.scale,
                zIndex: style.zIndex,
                opacity: style.opacity,
                rotateY: style.rotateY,
              }}
              whileHover={isActive ? { scale: 1.03, y: -4, transition: { duration: 0.2 } } : { scale: 0.83, transition: { duration: 0.2 } }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 26,
                mass: 0.8,
              }}
              onClick={() => {
                if (!isActive) {
                  setCurrentIndex(idx);
                } else {
                  // Cycle to the next image when clicking the active center image
                  setCurrentIndex((prev) => (prev + 1) % total);
                }
              }}
              className="rounded-xl overflow-hidden shadow-2xl border border-white/10 select-none bg-card group/slide cursor-pointer"
            >
              <img
                src={img}
                alt={`${title} - Screenshot ${idx + 1}`}
                draggable={false}
                className="w-full h-full object-contain"
              />
              
              {/* Overlay glass tint on inactive screenshots */}
              {!isActive && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                  <span className="text-[10px] text-white/95 tracking-widest uppercase font-mono px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 opacity-0 group-hover/slide:opacity-100 transition-opacity">
                    View
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pagination indicators under the deck */}
      {total > 1 && (
        <div className="absolute bottom-2 flex items-center gap-1.5 z-20 bg-black/35 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === i 
                  ? "bg-accent w-3.5" 
                  : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Curriculum Vitae Nusantara" },
      { name: "description", content: "Portfolio profesional bercitarasa Indonesia — pengalaman, pendidikan, proyek, sertifikat, dan testimoni." },
      { property: "og:title", content: "Portfolio — Curriculum Vitae Nusantara" },
      { property: "og:description", content: "Portfolio profesional bercitarasa Indonesia — pengalaman, pendidikan, proyek, sertifikat, dan testimoni." },
      { property: "og:url", content: "https://cvsayaanjar.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://cvsayaanjar.lovable.app/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "CV Nusantara",
        url: "https://cvsayaanjar.lovable.app/",
        jobTitle: "Developer",
      }),
    }],
  }),
  component: HomePage,
});

type SocialLinks = { linkedin?: string; github?: string; twitter?: string; instagram?: string; whatsapp?: string };

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

  const experiences = data?.experiences ?? [];
  const projects = data?.projects ?? [];
  const profile = data?.profile;
  const socialLinks = (profile?.social_links ?? {}) as any;

  const handleDownloadCV = () => {
    const sl = (profile?.social_links || {}) as any;
    const cvUrl = lang === "id" ? sl.cv_url_id : sl.cv_url_en;
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    } else {
      window.print();
    }
  };

  const yearsExp = useMemo(() => {
    if (socialLinks.experience_years) {
      const val = parseInt(socialLinks.experience_years, 10);
      if (!isNaN(val)) return val;
    }
    if (!experiences.length) return 0;
    const earliest = experiences.reduce((min, e) => {
      const y = new Date(e.start_date).getFullYear();
      return y < min ? y : min;
    }, new Date().getFullYear());
    return new Date().getFullYear() - earliest;
  }, [experiences, socialLinks.experience_years]);

  const totalProjects = useMemo(() => {
    if (socialLinks.completed_projects) {
      const val = parseInt(socialLinks.completed_projects, 10);
      if (!isNaN(val)) return val;
    }
    return projects.length;
  }, [projects.length, socialLinks.completed_projects]);

  const totalCertificates = useMemo(() => {
    if (socialLinks.certificates_count) {
      const val = parseInt(socialLinks.certificates_count, 10);
      if (!isNaN(val)) return val;
    }
    return data?.certificates?.length ?? 0;
  }, [data?.certificates?.length, socialLinks.certificates_count]);

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }

  const { education, skills, certificates, testimonials } = data;
  const social = (profile?.social_links ?? {}) as SocialLinks;

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});


  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden scroll-smooth">
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Glow Blobs halus */}
      <div className="pointer-events-none fixed inset-0 z-0 no-print">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <NavBar profile={profile} lang={lang} setLang={setLang} t={t} />

      {/* Hero */}
      <section id="about" className="relative pt-16 md:pt-32 pb-6 md:pb-20 px-4 md:px-6">
        {/* Background Batik Mega Mendung - Hanya di Hero */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ 
            backgroundImage: "url('/batik-bg.png')", 
            backgroundSize: "600px",
            backgroundRepeat: "repeat",
            maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)"
          }} 
        />
<Suspense fallback={null}>
  <ParallaxBackground />
</Suspense>
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-12 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-8"
          >
            <p className="text-xs tracking-[0.3em] text-accent uppercase mb-3 md:mb-5 flex items-center gap-3">
              <motion.span 
                initial={{ width: 0 }} 
                animate={{ width: 40 }} 
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-px bg-accent/60 inline-block" 
              /> {t("hero_kicker")}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl md:text-7xl leading-[1.05] mb-3 md:mb-6 text-primary">
              {profile?.full_name}
              <span className="block text-lg sm:text-3xl md:text-4xl italic text-accent mt-1 md:mt-2">— <Translate text={profile?.title ?? ""} /></span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl leading-relaxed"><Translate text={profile?.bio ?? ""} /></p>
            <p className="mt-3 md:mt-5 font-display italic text-primary/70 text-sm md:text-base">"{t("hero_quote")}"</p>

            {/* Mini Code Terminal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-4 md:mt-8 max-w-lg overflow-x-auto"
            >
              <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-black/30">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="ml-3 text-[10px] text-white/30 font-mono">portfolio.tsx</span>
                </div>
                <div className="p-4 font-mono text-xs leading-relaxed">
                  <TypingCode name={profile?.full_name ?? "Anjar Abidin"} skills={skills.map(s => s.name)} />
                </div>
              </div>
            </motion.div>

            {/* Stats counter */}
            <div className="mt-4 md:mt-10 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
              <Stat value={yearsExp} label={t("stat_experience")} />
              <Stat value={totalProjects} label={t("stat_projects")} />
              <Stat value={totalCertificates} label={t("stat_certificates")} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-4 flex justify-center md:justify-end"
          >
            {/* Profile Card (Adapted from User's Neumorphic Code to Glassmorphism) */}
            <div className="w-full max-w-[320px] rounded-3xl md:rounded-[2rem] p-4 sm:p-5 bg-card/60 backdrop-blur-md border border-white/40 shadow-2xl flex flex-col items-center">
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden mt-2 sm:mt-4 border-[3px] sm:border-4 border-white/60 shadow-inner bg-muted flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-muted-foreground/40" viewBox="0 0 122.88 122.88" fill="currentColor">
                    <path d="M61.44,0c8.32,0,16.25,1.66,23.5,4.66l0.11,0.05c7.47,3.11,14.2,7.66,19.83,13.3l0,0c5.66,5.65,10.22,12.42,13.34,19.95 c3.01,7.24,4.66,15.18,4.66,23.49c0,8.32-1.66,16.25-4.66,23.5l-0.05,0.11c-3.12,7.47-7.66,14.2-13.3,19.83l0,0 c-5.65,5.66-12.42,10.22-19.95,13.34c-7.24,3.01-15.18,4.66-23.49,4.66c-8.31,0-16.25-1.66-23.5-4.66l-0.11-0.05 c-7.47-3.11-14.2-7.66-19.83-13.29L18,104.87C12.34,99.21,7.78,92.45,4.66,84.94C1.66,77.69,0,69.76,0,61.44s1.66-16.25,4.66-23.5 l0.05-0.11c3.11-7.47,7.66-14.2,13.29-19.83L18.01,18c5.66-5.66,12.42-10.22,19.94-13.34C45.19,1.66,53.12,0,61.44,0L61.44,0z M16.99,94.47l0.24-0.14c5.9-3.29,21.26-4.38,27.64-8.83c0.47-0.7,0.97-1.72,1.46-2.83c0.73-1.67,1.4-3.5,1.82-4.74 c-1.78-2.1-3.31-4.47-4.77-6.8l-4.83-7.69c-1.76-2.64-2.68-5.04-2.74-7.02c-0.03-0.93,0.13-1.77,0.48-2.52 c0.36-0.78,0.91-1.43,1.66-1.93c0.35-0.24,0.74-0.44,1.17-0.59c-0.32-4.17-0.43-9.42-0.23-13.82c0.1-1.04,0.31-2.09,0.59-3.13 c1.24-4.41,4.33-7.96,8.16-10.4c2.11-1.35,4.43-2.36,6.84-3.04c1.54-0.44-1.31-5.34,0.28-5.51c7.67-0.79,20.08,6.22,25.44,12.01 c2.68,2.9,4.37,6.75,4.73,11.84l-0.3,12.54l0,0c1.34,0.41,2.2,1.26,2.54,2.63c0.39,1.53-0.03,3.67-1.33,6.6l0,0 c-0.02,0.05-0.05,0.11-0.08,0.16l-5.51,9.07c-2.02,3.33-4.08,6.68-6.75,9.31C73.75,80,74,80.35,74.24,80.7 c1.09,1.6,2.19,3.2,3.6,4.63c0.05,0.05,0.09,0.1,0.12,0.15c6.34,4.48,21.77,5.57,27.69,8.87l0.24,0.14 c6.87-9.22,10.93-20.65,10.93-33.03c0-15.29-6.2-29.14-16.22-39.15c-10-10.03-23.85-16.23-39.14-16.23 c-15.29,0-29.14,6.2-39.15,16.22C12.27,32.3,6.07,46.15,6.07,61.44C6.07,73.82,10.13,85.25,16.99,94.47L16.99,94.47L16.99,94.47z" />
                  </svg>
                )}
              </div>
              <div className="font-display text-2xl text-primary mt-5 text-center">
                {profile?.full_name}
              </div>
              
              <div className="text-xs text-muted-foreground mt-2 space-y-1 text-center">
                {profile?.location && <p><MapPin className="inline w-3 h-3 mr-1 text-accent" /><Translate text={profile.location} /></p>}
                {profile?.email && <p><Mail className="inline w-3 h-3 mr-1 text-accent" />{profile.email}</p>}
              </div>

              <div className="flex gap-5 bg-background/50 border border-white/20 rounded-full w-[90%] p-3 mt-6 mb-2 justify-center shadow-inner">
                {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="text-[#333] hover:scale-125 transition-transform"><Github className="w-5 h-5" /></a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="text-[#E1306C] hover:scale-125 transition-transform"><Instagram className="w-5 h-5" /></a>}
                {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="text-[#1DA1F2] hover:scale-125 transition-transform"><Twitter className="w-5 h-5" /></a>}
                {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-[#0077B5] hover:scale-125 transition-transform"><Linkedin className="w-5 h-5" /></a>}
              </div>

              <button
                onClick={handleDownloadCV}
                className="relative w-[90%] mt-3 mb-2 p-[1.5px] overflow-hidden rounded-xl bg-accent/20 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/15 transition-all duration-300"
              >
                <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_50%,#c2410c_80%,#451a03_100%)] z-0 pointer-events-none" />
                <div className="relative z-10 w-full h-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-[10.5px] py-2.5 text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors">
                  <Download className="w-4 h-4" /> {t("download_cv")}
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Divider label={t("section_experience")} />

      {/* Experience - Animated Timeline */}
      <section id="experience" className="relative py-6 md:py-20 px-4 md:px-6">
        {/* Decorative accent bar */}
        <div className="pointer-events-none absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent via-accent/30 to-transparent" />
        <div className="pointer-events-none absolute top-10 right-0 w-[350px] h-[350px] bg-accent/8 rounded-full blur-[80px]" />
        {/* Ilustrasi Wayang + Laptop */}
        <img 
          src="/illust-experience.png" 
          alt="" 
          className="pointer-events-none absolute -right-10 top-10 w-[280px] opacity-15 hidden lg:block select-none"
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto">
          {/* Animated vertical line */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-0 md:left-[140px] top-0 w-px bg-gradient-to-b from-accent via-accent/50 to-transparent hidden md:block"
          />
          <div className="space-y-6 md:space-y-12">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: i * 0.15, type: "spring", stiffness: 100 }}
              className="grid md:grid-cols-12 gap-1.5 md:gap-6 group relative"
            >
              {/* Timeline dot */}
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                className="hidden md:block absolute left-[136px] top-2 w-3 h-3 rounded-full bg-accent shadow-[0_0_12px_rgba(180,90,50,0.6)] z-10"
              />
              <div className="md:col-span-3 text-[10px] md:text-sm text-muted-foreground tracking-wider font-mono pt-1">
                {formatMonthYear(exp.start_date, lang)} — {exp.end_date ? formatMonthYear(exp.end_date, lang) : t("present")}
              </div>
              <div className="md:col-span-9 bg-card/40 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-6 group-hover:border-accent/50 group-hover:shadow-lg group-hover:shadow-accent/5 transition-all duration-500">
                <h3 className="font-display text-lg md:text-3xl mb-0.5 text-primary group-hover:text-accent transition-colors duration-300"><Translate text={exp.role} /></h3>
                <p className="text-accent mb-2 text-xs md:text-sm italic">{exp.company}</p>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed"><Translate text={exp.description} maxChars={130} /></p>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      <Divider label={t("section_education")} />

      {/* Education */}
      <section id="education" className="relative py-12 md:py-20 px-5 md:px-6">
        {/* Section glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="relative max-w-6xl mx-auto">
          {education.length === 0 ? (
            <p className="text-muted-foreground italic text-center">{t("no_education")}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {education.map((ed, i) => {
                const parseEduDesc = (desc: string) => {
                  if (!desc) return { text: "", logoUrl: "" };
                  const parts = desc.split("||logo:");
                  return { text: parts[0] || "", logoUrl: parts[1] || "" };
                };
                const { text: eduText, logoUrl } = parseEduDesc(ed.description);

                return (
                  <motion.article
                    key={ed.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="bg-card/60 backdrop-blur-md shadow-xl border border-white/40 dark:border-white/10 p-5 md:p-6 rounded-xl hover:border-accent/60 transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      {logoUrl ? (
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-inner">
                          <img src={logoUrl} alt={ed.institution} className="w-full h-full object-contain rounded-lg" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 shadow-inner">
                          <GraduationCap className="w-6 h-6 text-accent" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-display text-xl text-primary leading-tight"><Translate text={ed.institution} /></h3>
                        <p className="text-sm text-accent italic mt-1">
                          <Translate text={ed.degree ?? ""} />
                          {ed.degree && ed.field && " · "}
                          <Translate text={ed.field ?? ""} />
                        </p>
                      </div>
                    </div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {ed.start_year ?? "—"} — {ed.end_year ?? t("present")}
                    </div>
                    {eduText && (
                      <p className="text-sm text-muted-foreground leading-relaxed"><Translate text={eduText} maxChars={130} /></p>
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Divider label={t("section_projects")} />

      {/* Projects */}
      <section id="projects" className="relative py-6 md:py-20 px-4 md:px-6">
        {/* Decorative gradient band */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />
        
        <div className="relative max-w-6xl mx-auto">
          {projects.map((p, i) => {
            const isEven = i % 2 === 1;
            const hasLinks = p.live_url || p.repo_url;
            const images = p.image_url ? p.image_url.split(",").map(u => u.trim()).filter(Boolean) : [];
            const hasImages = images.length > 0;
            
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center py-6 lg:py-16 ${
                  i !== 0 ? "border-t border-border/40" : ""
                }`}
              >
                {/* 1. Image Showcase Column (Always order-2 on mobile, alternates on desktop) */}
                <div 
                  className={`order-2 lg:col-span-7 relative group w-full ${
                    isEven ? "lg:order-last" : "lg:order-first"
                  }`}
                >
                  <div className="relative w-full rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-2 shadow-2xl hover:border-accent/40 transition-all duration-500 hover:shadow-accent/5">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/65 border border-border/30 w-full min-h-0">
                      {hasImages ? (
                        <ProjectImageSlider images={images} title={p.title} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-card/50 text-accent/50 p-6 text-center">
                          <NusantaraGlyph className="w-16 h-16 opacity-30 text-accent mb-4 animate-pulse" />
                          <p className="font-display text-sm font-semibold tracking-wider">PROJECT SHOWCASE</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Decorative background glow */}
                  <div className="pointer-events-none absolute -inset-4 bg-accent/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>

                {/* 2. Text / Info Column (Always order-1 on mobile, alternates on desktop) */}
                <div 
                  className={`order-1 lg:col-span-5 flex flex-col justify-center space-y-5 w-full ${
                    isEven ? "lg:order-first" : "lg:order-last"
                  }`}
                >
                  <div>
                    <span className="font-mono text-xs text-accent tracking-widest font-bold">PROJECT #{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-primary font-semibold mt-1 tracking-tight leading-tight">
                      <Translate text={p.title} />
                    </h3>
                    <div className="w-12 h-1 bg-accent mt-3 rounded-full" />
                  </div>

                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    <Translate text={p.description} maxChars={130} />
                  </p>

                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {p.technologies.map((tech) => (
                      <span 
                        key={tech} 
                        className="text-[10px] uppercase font-mono px-3 py-1 bg-accent/8 text-primary border border-accent/20 tracking-wider rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-300 cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Link / Enterprise Tag */}
                  <div className="pt-4 border-t border-border/40 flex items-center gap-4">
                    {hasLinks ? (
                      <div className="flex items-center gap-3 text-xs font-mono">
                        {p.repo_url && (
                          <a 
                            href={p.repo_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-4 py-2 rounded-xl bg-card border border-border text-primary hover:border-accent hover:text-accent transition-all flex items-center gap-1.5"
                          >
                            GitHub <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {p.live_url && (
                          <a 
                            href={p.live_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all flex items-center gap-1.5"
                          >
                            Live Demo <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-muted-foreground/80 text-[10px] uppercase font-mono tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulse" />
                        Private Commercial App
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Divider label={t("section_skills")} />

      {/* Skills - Animated Bars with Glow */}
      <section id="skills" className="relative py-12 md:py-20 px-5 md:px-6 overflow-hidden">
        {/* Ilustrasi Borobudur Code */}
        <img 
          src="/illust-skills.png" 
          alt="" 
          className="pointer-events-none absolute -left-10 bottom-0 w-[300px] opacity-10 hidden lg:block select-none"
          aria-hidden="true"
        />
        {/* Floating code particles */}
        <div className="pointer-events-none absolute inset-0">
          {['</', '/>', '{...}', '()', '=>', '[]', '&&', '||', '::'].map((code, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: [0, 0.15, 0.15, 0], y: [-20, -200] }}
              viewport={{ once: true }}
              transition={{ duration: 4, delay: i * 0.4, repeat: Infinity, repeatDelay: 6 }}
              className="absolute text-accent/20 font-mono text-sm"
              style={{ left: `${10 + i * 10}%` }}
            >
              {code}
            </motion.span>
          ))}
        </div>
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-3 gap-6 md:gap-10">
          {Object.entries(skillsByCategory).map(([cat, items], catIdx) => (
            <motion.div 
              key={cat}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: catIdx * 0.2 }}
              className="bg-card/40 backdrop-blur-sm border border-white/20 rounded-xl p-5 md:p-6 hover:border-accent/40 transition-all duration-500"
            >
              <h3 className="font-display text-xl md:text-2xl text-accent mb-5 md:mb-6">{cat}</h3>
              <div className="space-y-5">
                {items.map((s, sIdx) => (
                  <div key={s.id}>
                    <Suspense fallback={null}>
  <WaveSkillBar label={s.name} value={s.proficiency} />
</Suspense>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Divider label={t("section_certificates")} />

      {/* Certificates */}
      <section id="certificates" className="relative py-12 md:py-20 px-5 md:px-6">
        <div className="pointer-events-none absolute top-10 left-0 w-[300px] h-[300px] bg-primary/8 rounded-full blur-[80px]" />
        <div className="relative max-w-6xl mx-auto">
          {certificates.length === 0 ? (
            <p className="text-muted-foreground italic text-center">{t("no_certificates")}</p>
          ) : (
            <CertificateExplorer certificates={certificates} />
          )}
        </div>
      </section>

      <Divider label={t("section_testimonials")} />

      {/* Testimonials */}
      <section id="testimonials" className="relative py-12 md:py-20 px-5 md:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent" />
        <div className="pointer-events-none absolute bottom-10 right-10 w-[250px] h-[250px] bg-accent/10 rounded-full blur-[80px]" />
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
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="relative bg-card/60 backdrop-blur-md shadow-xl border border-white/40 dark:border-white/10 p-5 md:p-6 rounded-xl hover:border-accent/60 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-500"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/20" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: tm.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-primary/90 leading-relaxed italic mb-5 font-display text-lg">"<Translate text={tm.quote} />"</p>
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
                      <p className="text-xs text-muted-foreground">
                        <Translate text={tm.role ?? ""} />
                        {tm.role && tm.company && " · "}
                        <Translate text={tm.company ?? ""} />
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Divider label={t("section_contact")} />

      {/* Contact Section */}
      <section id="contact" className="relative py-6 md:py-16 px-4 md:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-accent/3 to-transparent" />
        <div className="pointer-events-none absolute top-1/2 left-10 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="relative max-w-5xl mx-auto z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card/60 backdrop-blur-md shadow-xl border border-white/40 dark:border-white/10 rounded-3xl md:rounded-[2rem] p-5 md:p-10 overflow-hidden relative"
          >
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-3xl md:text-5xl text-primary mb-3 md:mb-4 tracking-tight">
                    {t("contact_me")}
                  </h2>
                  <div className="w-12 h-1 bg-accent mb-5 md:mb-6 rounded-full" />
                  
                  {/* Availability & Response Time Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-full font-medium shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {lang === "id" ? "Tersedia" : "Available for Hire"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs px-2.5 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full font-medium shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      {lang === "id" ? "Balas cepat (< 2 jam)" : "Fast response (< 2 hrs)"}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                    {t("contact_intro")}
                  </p>
                  
                  <div className="space-y-4">
                    {profile?.email && (
                      <a href={`mailto:${profile.email}`} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-background shadow-sm border border-border flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Email</span>
                          <span className="text-primary font-medium text-sm md:text-base group-hover:text-accent transition-colors break-all">{profile.email}</span>
                        </div>
                      </a>
                    )}
                    
                    {profile?.location && (
                      <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-background shadow-sm border border-border flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{lang === "id" ? "Lokasi" : "Location"}</span>
                          <span className="text-primary font-medium text-sm md:text-base group-hover:text-accent transition-colors"><Translate text={profile.location} /></span>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp CTA Link */}
                    {social.whatsapp && (
                      <a 
                        href={social.whatsapp.startsWith("http") ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-background shadow-sm border border-border flex items-center justify-center text-muted-foreground group-hover:text-green-500 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300 shrink-0">
                          <svg className="w-4 h-4 fill-current text-green-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.488 5.336 1.489 5.503 0 9.978-4.479 9.981-9.986.002-2.668-1.03-5.176-2.905-7.054C17.186 1.725 14.683.69 12.01.69c-5.508 0-9.987 4.479-9.99 9.988-.001 2.05.504 3.659 1.489 5.222L2.52 21.436l5.776-1.517.351.205z" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">WhatsApp</span>
                          <span className="text-primary font-medium text-sm md:text-base group-hover:text-green-500 transition-colors">Chat on WhatsApp</span>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3.5 mt-8 lg:mt-0">
                  {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:-translate-y-1 transition-all duration-300"><Github className="w-4 h-4" /></a>}
                  {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent hover:-translate-y-1 transition-all duration-300"><Instagram className="w-4 h-4" /></a>}
                  {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] hover:-translate-y-1 transition-all duration-300"><Linkedin className="w-4 h-4" /></a>}
                  {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:-translate-y-1 transition-all duration-300"><Twitter className="w-4 h-4" /></a>}
                </div>
              </div>
              
              <div className="lg:col-span-7 bg-background/40 backdrop-blur-sm rounded-2xl p-5 md:p-7 border border-border relative z-10">
                <ContactForm />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-10 md:py-16 px-5 md:px-6 border-t border-border mt-6 md:mt-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent" />
        <GununganOrnament className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-48 text-accent/20" />
        <div className="relative max-w-6xl mx-auto text-center">
          <SulurDivider className="w-48 h-5 mx-auto text-accent/50 mb-4" />
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <NusantaraGlyph className="w-4 h-4 text-accent/70" />
            <span>© {new Date().getFullYear()} {profile?.full_name} · {t("footer_made")}</span>
            <NusantaraGlyph className="w-4 h-4 text-accent/70" />
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-[10px] text-muted-foreground/50 mt-3 font-mono"
          >
            Built with React · TypeScript · Supabase · Framer Motion
          </motion.p>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="no-print fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        <BackToTop />
        {(social.whatsapp || social.linkedin) && (
          <a
            href={social.whatsapp || social.linkedin}
            target="_blank"
            rel="noreferrer"
            className="w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
            aria-label="Quick contact"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ---------- sub components ---------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent via-primary to-accent z-50 origin-left no-print"
    />
  );
}

function TypingCode({ name, skills }: { name: string; skills: string[] }) {
  const topSkills = skills.length > 0 ? skills.slice(0, 3) : ["React", "TypeScript", "Node.js"];

  const lines = [
    { indent: 0, parts: [{ text: "const ", color: "#c792ea" }, { text: "developer", color: "#82aaff" }, { text: " = {", color: "#89ddff" }] },
    { indent: 1, parts: [{ text: "name", color: "#f78c6c" }, { text: ": ", color: "#89ddff" }, { text: `"${name}"`, color: "#c3e88d" }, { text: ",", color: "#89ddff" }] },
    { indent: 1, parts: [
      { text: "skills", color: "#f78c6c" }, 
      { text: ": [", color: "#89ddff" },
      ...topSkills.map((s, idx) => [
        { text: `"${s}"`, color: "#c3e88d" },
        ...(idx < topSkills.length - 1 ? [{ text: ", ", color: "#89ddff" }] : [])
      ]).flat(),
      { text: "]", color: "#89ddff" },
      { text: ",", color: "#89ddff" }
    ] },
    { indent: 1, parts: [{ text: "passion", color: "#f78c6c" }, { text: ": ", color: "#89ddff" }, { text: "\"Building beautiful things\"", color: "#c3e88d" }, { text: ",", color: "#89ddff" }] },
    { indent: 1, parts: [{ text: "available", color: "#f78c6c" }, { text: ": ", color: "#89ddff" }, { text: "true", color: "#ff5370" }] },
    { indent: 0, parts: [{ text: "};", color: "#89ddff" }] },
  ];

  const [visibleLines, setVisibleLines] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= lines.length) { clearInterval(timer); return prev; }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-1">
      {lines.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start"
        >
          <span className="text-white/20 select-none mr-3 w-4 text-right shrink-0 font-mono">{i + 1}</span>
          <div className="flex-1 min-w-0 font-mono" style={{ paddingLeft: `${line.indent * 16}px` }}>
            <div className="break-words whitespace-pre-wrap leading-relaxed">
              {line.parts.map((part, j) => (
                <span key={j} style={{ color: part.color }}>{part.text}</span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
      {visibleLines < lines.length && (
        <span className="inline-block w-1.5 h-4 bg-accent/80 animate-pulse ml-7 mt-0.5" />
      )}
    </div>
  );
}

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
      className="relative z-10 flex flex-col gap-5"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <Input 
          placeholder={t("form_name")} 
          value={form.name} 
          maxLength={100} 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          required 
          className="bg-background border-border rounded-xl px-4 text-primary font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent shadow-sm transition-all h-12"
        />
        <Input 
          type="email" 
          placeholder={t("form_email")} 
          value={form.email} 
          maxLength={255} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          required 
          className="bg-background border-border rounded-xl px-4 text-primary font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent shadow-sm transition-all h-12"
        />
      </div>
      <Input 
        placeholder={t("form_subject")} 
        value={form.subject} 
        maxLength={200} 
        onChange={(e) => setForm({ ...form, subject: e.target.value })} 
        className="bg-background border-border rounded-xl px-4 text-primary font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent shadow-sm transition-all h-12"
      />
      <Textarea 
        placeholder={t("form_message")} 
        rows={4} 
        value={form.message} 
        maxLength={2000} 
        onChange={(e) => setForm({ ...form, message: e.target.value })} 
        required 
        className="bg-background border-border rounded-xl px-4 py-3 text-primary font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent shadow-sm transition-all resize-none"
      />
      <Button 
        type="submit" 
        disabled={send.isPending} 
        className="mt-2 w-full h-12 rounded-xl bg-accent text-accent-foreground font-medium tracking-wide hover:opacity-90 hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all duration-300"
      >
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

/* ---------- NavBar with Mobile Menu & Dark Mode ---------- */

function NavBar({ profile, lang, setLang, t }: { profile: any; lang: "id" | "en"; setLang: (l: "id" | "en") => void; t: (k: DictKey) => string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const handleDownloadCV = () => {
    const sl = profile?.social_links || {};
    const cvUrl = lang === "id" ? sl.cv_url_id : sl.cv_url_en;
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    } else {
      window.print();
    }
  };

  const navLinks = [
    { href: "#about", label: t("nav_about") },
    { href: "#experience", label: t("nav_experience") },
    { href: "#education", label: t("nav_education") },
    { href: "#projects", label: t("nav_projects") },
    { href: "#skills", label: t("nav_skills") },
    { href: "#testimonials", label: t("nav_testimonials") },
    { href: "#contact", label: t("nav_contact") },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/85 border-b border-border no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
          <NusantaraGlyph className="w-5 h-5 text-accent" />
          <span>{(profile?.social_links as any)?.logo_text || profile?.full_name?.split(" ")[0] || "CV"}</span>
        </Link>
        <nav className="hidden lg:flex gap-7 text-sm text-muted-foreground">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="hover:text-primary transition-colors">{l.label}</a>
          ))}
          <Link to="/blog" className="hover:text-primary transition-colors">{t("nav_blog")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 rounded-full border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="text-xs px-2 py-1 border border-border hover:border-primary rounded-full inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="w-3 h-3" /> {lang.toUpperCase()}
          </button>
          <button
            onClick={handleDownloadCV}
            className="relative hidden sm:inline-flex p-[1.5px] overflow-hidden rounded-full bg-accent/20 cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent/15 transition-all duration-300"
          >
            <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_50%,#c2410c_80%,#451a03_100%)] z-0 pointer-events-none" />
            <div className="relative z-10 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
              <Download className="w-3.5 h-3.5" /> {t("download_cv")}
            </div>
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-4 space-y-3"
        >
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/blog"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
          >
            {t("nav_blog")}
          </Link>
          {/* Mobile CTAs */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleDownloadCV();
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl font-medium"
            >
              <Download className="w-3.5 h-3.5" /> {t("download_cv")}
            </button>
          </div>
        </motion.nav>
      )}
    </header>
  );
}

/* ---------- Back to Top ---------- */

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border text-primary shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </motion.button>
  );
}

/* ---------- Loading Skeleton ---------- */

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav skeleton */}
      <div className="h-16 border-b border-border bg-background/85 backdrop-blur-md flex items-center px-6 gap-4">
        <div className="w-24 h-6 bg-muted rounded-full animate-pulse" />
        <div className="flex-1" />
        <div className="w-16 h-6 bg-muted rounded-full animate-pulse" />
      </div>
      {/* Hero skeleton */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-6">
          <div className="w-32 h-4 bg-muted rounded-full animate-pulse" />
          <div className="w-3/4 h-14 bg-muted rounded-xl animate-pulse" />
          <div className="w-1/2 h-10 bg-muted rounded-xl animate-pulse" />
          <div className="space-y-3">
            <div className="w-full h-4 bg-muted rounded animate-pulse" />
            <div className="w-5/6 h-4 bg-muted rounded animate-pulse" />
            <div className="w-4/6 h-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-6 mt-8">
            <div className="w-20 h-16 bg-muted rounded-lg animate-pulse" />
            <div className="w-20 h-16 bg-muted rounded-lg animate-pulse" />
            <div className="w-20 h-16 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <div className="w-[320px] h-[420px] bg-muted rounded-[2rem] animate-pulse" />
        </div>
      </div>
      {/* Section skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} className="max-w-6xl mx-auto px-6 py-10">
          <div className="w-40 h-4 bg-muted rounded-full animate-pulse mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded-xl animate-pulse" />
            <div className="h-48 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}