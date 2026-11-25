import type { Tables } from "@/integrations/supabase/types";

export type PortfolioData = {
  profile: Tables<"profiles"> | null;
  experiences: Tables<"experiences">[];
  education: Tables<"education">[];
  projects: Tables<"projects">[];
  skills: Tables<"skills">[];
  certificates: Tables<"certificates">[];
  testimonials: Tables<"testimonials">[];
};

const OLD_AVATAR_MARKER = "hoib653n0su-1779192754541";

const PONDOK_EXPERIENCE: Tables<"experiences"> = {
  id: "pondok-pesantren-demak",
  company: "Pondok Pesantren, Kab. Demak",
  role: "Pengembang Perangkat Lunak",
  start_date: "2026-09-01",
  end_date: null,
  description:
    "Ditugaskan melakukan debugging dan perbaikan bug pada sistem pondok pesantren berbasis Laravel yang sudah berjalan\n" +
    "Menambahkan beberapa fitur baru pada sistem yang sudah berjalan\n" +
    "Mendukung sistem yang digunakan oleh sekitar 1.000 wali santri\n" +
    "Saat ini berperan memantau (monitoring) sistem yang berjalan",
  display_order: 6,
  created_at: "2026-09-01T00:00:00.000Z",
};

const BIRO_WISATA_PROJECT: Tables<"projects"> = {
  id: "project-catat-biro-wisata",
  title: "Catat Trip Nusantara — Pencatatan Agen Biro Wisata",
  description:
    "Aplikasi pencatatan operasional agen biro wisata berbasis web & PWA untuk mengelola jadwal armada bus, target omset & KPI, buku kas & laba bersih, laporan invoice resmi, serta dukungan AI Copilot dan kontrol akses RBAC (Pemilik Biro & Kru/TL).",
  technologies: ["React", "TypeScript", "Tailwind CSS", "PWA"],
  live_url: "https://catatbirowisata-6mpo.vercel.app/",
  repo_url: null,
  image_url: [
    "/projects/biro-2-dashboard.png",
    "/projects/biro-3-target-kpi.png",
    "/projects/biro-4-kalender-bus.png",
    "/projects/biro-5-buku-kas.png",
    "/projects/biro-6-laporan-invoice.png",
    "/projects/biro-7-ai-copilot.png",
    "/projects/biro-1-login.png",
  ].join(", "),
  display_order: 4,
  created_at: "2026-11-25T00:00:00.000Z",
};

const APOTEK_SIMAAF_PROJECT: Tables<"projects"> = {
  id: "project-simaaf-apotek-asahan-farma",
  title: "SIMAAF — Apotek Asahan Farma (Frontend)",
  description:
    "Tampilan frontend sistem inventori & pengawasan retur obat (FEFO) untuk Apotek Asahan Farma — tugas program Asah 2026 Dicoding by GoTo (khusus sisi frontend), mencakup dashboard aset & risiko retur, pengingat kedaluwarsa, input faktur PBF, stok & batch, serta kalender PBF.",
  technologies: ["React", "TypeScript", "Tailwind CSS", "Frontend Only"],
  live_url: "https://demosimaaf.web.id",
  repo_url: null,
  image_url: [
    "/projects/apotek-1-dashboard.png",
    "/projects/apotek-2-retur.png",
    "/projects/apotek-3-faktur.png",
    "/projects/apotek-4-stok.png",
    "/projects/apotek-5-kalender.png",
  ].join(", "),
  display_order: 5,
  created_at: "2026-11-25T00:00:00.000Z",
};

const EXTRA_TOOL_SKILLS: Tables<"skills">[] = [
  {
    id: "skill-tool-vercel",
    category: "Tools",
    name: "Vercel / Deployment",
    proficiency: 85,
    display_order: 8,
    created_at: "2026-11-25T00:00:00.000Z",
  },
  {
    id: "skill-tool-figma",
    category: "Tools",
    name: "Figma",
    proficiency: 80,
    display_order: 9,
    created_at: "2026-11-25T00:00:00.000Z",
  },
];

const ROLE_CASE_MAP: Record<string, string> = {
  "developer/owner": "Developer / Owner",
  "junior software developer": "Junior Software Developer",
  "intern it": "IT Intern",
  "kontributor proyek": "Kontributor Proyek",
  "proyek tim pribadi": "Proyek Tim Pribadi",
};

const PROJECT_POLISH_MAP: Record<string, { title?: string; description?: string }> = {
  "hris absensi pintar": { title: "HRIS Absensi Pintar" },
  "kasirq pos": {
    description:
      "Platform kasir (POS) modern untuk operasional toko, manajemen produk, dan transaksi cepat.",
  },
  "kasirq-cafe/resto": {
    title: "KasirQ — Cafe / Resto",
    description:
      "Pengembangan lanjutan KasirQ yang berfokus pada operasional F&B, manajemen menu, dan laporan penjualan.",
  },
};

/**
 * Applies requested portfolio updates and polish when the live Supabase records
 * still reflect the previous values, allowing future admin edits to take precedence.
 */
export function applyPortfolioUpdates(data: PortfolioData): PortfolioData {
  const profile = data.profile
    ? {
        ...data.profile,
        avatar_url:
          !data.profile.avatar_url || data.profile.avatar_url.includes(OLD_AVATAR_MARKER)
            ? "/avatar-anjar.jpg"
            : data.profile.avatar_url,
      }
    : null;

  const experiences = data.experiences.map((exp) => {
    const companyLower = exp.company.toLowerCase();
    const roleKey = exp.role.trim().toLowerCase();
    const polishedRole = ROLE_CASE_MAP[roleKey] ?? exp.role.trim();

    // KasirQ: 5 bulan (Feb 2025 - Jun 2025)
    if (companyLower.includes("kasirq") && !exp.end_date) {
      return { ...exp, role: polishedRole, end_date: "2025-06-01" };
    }

    // Kontributor Proyek PT CMS Duta Solusi: 3 bulan (Apr 2026 - Jun 2026)
    if (companyLower.includes("cms duta solusi") && roleKey.includes("kontributor") && !exp.end_date) {
      return { ...exp, role: polishedRole, end_date: "2026-06-01" };
    }

    return polishedRole !== exp.role ? { ...exp, role: polishedRole } : exp;
  });

  const hasPondok = experiences.some((exp) => exp.company.toLowerCase().includes("pondok"));
  if (!hasPondok) {
    experiences.push(PONDOK_EXPERIENCE);
  }

  experiences.sort((a, b) => a.display_order - b.display_order);

  const projects = data.projects
    .filter(
      (p) =>
        !(
          p.title.trim().toLowerCase() === "ai chat app" &&
          !p.image_url &&
          p.live_url === "https://example.com"
        )
    )
    .map((p) => {
      const polish = PROJECT_POLISH_MAP[p.title.trim().toLowerCase()];
      if (!polish) return p;
      return {
        ...p,
        title: polish.title ?? p.title,
        description:
          p.description.trim().toLowerCase() === "platform kasir dengan kualitas modern" ||
          p.description.trim().toLowerCase().startsWith("dalam pengembangan kasirq")
            ? (polish.description ?? p.description)
            : p.description,
      };
    });

  const hasBiro = projects.some(
    (p) =>
      p.title.toLowerCase().includes("biro") ||
      (p.live_url ?? "").toLowerCase().includes("catatbirowisata")
  );
  if (!hasBiro) {
    projects.push(BIRO_WISATA_PROJECT);
  }

  const hasApotek = projects.some(
    (p) =>
      p.title.toLowerCase().includes("apotek") ||
      p.title.toLowerCase().includes("simaaf") ||
      (p.live_url ?? "").toLowerCase().includes("demosimaaf")
  );
  if (!hasApotek) {
    projects.push(APOTEK_SIMAAF_PROJECT);
  }

  projects.sort((a, b) => a.display_order - b.display_order);

  const skills = [...data.skills];
  const toolsCount = skills.filter((s) => s.category.toLowerCase() === "tools").length;
  if (toolsCount <= 1) {
    for (const extra of EXTRA_TOOL_SKILLS) {
      if (!skills.some((s) => s.name.toLowerCase() === extra.name.toLowerCase())) {
        skills.push(extra);
      }
    }
  }

  const certificates = data.certificates.map((c) => {
    const trimmed = c.issuer.trim();
    if (trimmed.toLowerCase() === "coursera" && trimmed !== "Coursera") {
      return { ...c, issuer: "Coursera" };
    }
    return c;
  });

  return {
    ...data,
    profile,
    experiences,
    projects,
    skills,
    certificates,
  };
}
