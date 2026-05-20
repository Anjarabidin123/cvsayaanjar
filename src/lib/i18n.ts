import { createContext, useContext, useEffect, useState, type ReactNode, createElement } from "react";

export type Lang = "id" | "en";

const dict = {
  id: {
    nav_about: "Tentang",
    nav_experience: "Pengalaman",
    nav_education: "Pendidikan",
    nav_projects: "Proyek",
    nav_skills: "Keahlian",
    nav_certificates: "Sertifikat",
    nav_testimonials: "Testimoni",
    nav_contact: "Kontak",
    nav_blog: "Blog",
    download_cv: "Unduh CV",
    admin: "Admin",
    hero_kicker: "Curriculum Vitae · Nusantara",
    hero_quote: "Sedikit bicara, banyak bekerja.",
    contact_me: "Hubungi Saya",
    section_experience: "01 — Pengalaman",
    section_education: "02 — Pendidikan",
    section_projects: "03 — Proyek Pilihan",
    section_skills: "04 — Keahlian",
    section_certificates: "05 — Sertifikat",
    section_testimonials: "06 — Testimoni",
    section_contact: "07 — Hubungi",
    stat_experience: "Tahun Pengalaman",
    stat_projects: "Proyek Selesai",
    stat_certificates: "Sertifikat",
    no_certificates: "Belum ada sertifikat ditambahkan.",
    no_testimonials: "Belum ada testimoni.",
    no_education: "Belum ada riwayat pendidikan.",
    form_name: "Nama",
    form_email: "Email",
    form_subject: "Subjek",
    form_message: "Pesan",
    form_send: "Kirim Pesan",
    form_sending: "Mengirim...",
    form_success: "Pesan terkirim. Terima kasih!",
    form_error: "Gagal mengirim pesan",
    contact_intro: "Punya proyek menarik? Mari berkolaborasi.",
    present: "Sekarang",
    loading: "Memuat...",
    footer_made: "Dibuat dengan rasa di Indonesia",
  },
  en: {
    nav_about: "About",
    nav_experience: "Experience",
    nav_education: "Education",
    nav_projects: "Projects",
    nav_skills: "Skills",
    nav_certificates: "Certificates",
    nav_testimonials: "Testimonials",
    nav_contact: "Contact",
    nav_blog: "Blog",
    download_cv: "Download CV",
    admin: "Admin",
    hero_kicker: "Curriculum Vitae · Archipelago",
    hero_quote: "Less talk, more work.",
    contact_me: "Get in Touch",
    section_experience: "01 — Experience",
    section_education: "02 — Education",
    section_projects: "03 — Selected Work",
    section_skills: "04 — Skills",
    section_certificates: "05 — Certificates",
    section_testimonials: "06 — Testimonials",
    section_contact: "07 — Contact",
    stat_experience: "Years of Experience",
    stat_projects: "Completed Projects",
    stat_certificates: "Certificates",
    no_certificates: "No certificates yet.",
    no_testimonials: "No testimonials yet.",
    no_education: "No education added yet.",
    form_name: "Name",
    form_email: "Email",
    form_subject: "Subject",
    form_message: "Message",
    form_send: "Send Message",
    form_sending: "Sending...",
    form_success: "Message sent. Thank you!",
    form_error: "Failed to send message",
    contact_intro: "Have an interesting project? Let's collaborate.",
    present: "Present",
    loading: "Loading...",
    footer_made: "Crafted with heart in Indonesia",
  },
} as const;

export type DictKey = keyof typeof dict.id;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string };
const LangContext = createContext<Ctx>({ lang: "id", setLang: () => {}, t: (k) => dict.id[k] });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved === "id" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const t = (k: DictKey) => dict[lang][k];
  return createElement(LangContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useI18n() {
  return useContext(LangContext);
}