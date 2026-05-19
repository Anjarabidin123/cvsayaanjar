## Goal
Tambah section **Blog/Artikel** + polish **SEO, mobile, performa**, plus seed data dummy biar section yang kosong langsung kelihatan rame.

---

## 1. Blog / Artikel (fitur baru)

**Database** — tabel baru `posts`:
- `slug` (text, unique) — buat URL `/blog/cara-belajar-react`
- `title`, `excerpt`, `content` (markdown), `cover_url`
- `tags` (text[]), `is_published` (bool), `published_at`, `reading_minutes`
- RLS: publik baca yg `is_published=true`, admin full access

**Routes baru:**
- `/blog` — daftar artikel (grid cover + judul + excerpt + tag)
- `/blog/$slug` — detail artikel (render markdown + meta SEO per-artikel)
- `/admin/posts` — CRUD artikel (editor markdown sederhana + upload cover)

**Nav update:** tambah link "Blog" di header utama + admin sidebar.

**Markdown rendering:** `react-markdown` + `remark-gfm` (table, checkbox, strikethrough).

---

## 2. Polish SEO

**Per-route `head()` meta** (sekarang cuma di root):
- `/` → title + description + og dari profil
- `/blog` → daftar artikel
- `/blog/$slug` → judul + excerpt + cover sebagai og:image (dynamic dari loader)
- Canonical URL di tiap leaf route
- JSON-LD `Person` schema di root (nama, jobTitle, sameAs sosmed)
- JSON-LD `Article` schema di blog post

**Tambahan:**
- `public/robots.txt` allow all + link sitemap
- Route `/sitemap.xml` — generate dari profil + projects + posts
- Open Graph image default (generate via imagegen) untuk share di WA/LinkedIn

---

## 3. Polish Mobile

Review section per section di viewport 411px:
- Hero: stats counter sering overflow, perlu grid 2x2 di HP
- Project slider 3D: di HP card kiri/kanan terlalu mepet, kurangi rotateY + scale
- Sertifikat explorer: tab/grid touch target ditambah
- Form kontak: input height min 44px (Apple HIG)
- Floating WhatsApp button: posisi jangan nutupin tombol back-to-top
- Header mobile: hamburger menu yang sekarang panjang, jadikan drawer fullscreen
- Spacing section: kurangi padding vertikal di mobile (py-32 → py-16)

---

## 4. Polish Performa

- **Image optimization**: semua upload via `<ImageUpload>` paksa convert ke WebP, max width 1600px
- **Preload LCP**: hero image / avatar di-preload via `head().links`
- **Lazy load** sertifikat & testimoni section pakai `IntersectionObserver`
- **Code split**: pisahkan `framer-motion` heavy components yg di bawah fold
- **Font loading**: `font-display: swap` (cek di styles.css)
- **Bundle audit**: cek apakah `ParallaxBackground`, `TiltCard`, `WaveSkillBar` benar-benar dipakai — drop yg gak kepakai
- Remove console.log production

---

## 5. Seed Data Dummy

Insert data contoh yg realistis (bisa kamu edit/hapus nanti via /admin):
- **Profile**: bio sample 2 paragraf
- **Experiences**: 2 pengalaman dummy (Frontend Dev, Intern UI/UX)
- **Education**: 2 (SMK + Universitas)
- **Projects**: 3 proyek dummy dengan placeholder image
- **Skills**: 8 skill umum (React, TS, Tailwind, dll)
- **Certificates**: 2 sertifikat sample
- **Testimonials**: 2 testimoni dummy
- **Posts**: 2 artikel blog sample ("Cara saya belajar React" + "Setup Tailwind v4")

---

## File changes

**New:**
- `supabase/migrations/...` — tabel `posts` + seed insert
- `src/routes/blog.tsx`, `src/routes/blog.$slug.tsx`
- `src/routes/admin.posts.tsx`
- `src/routes/sitemap[.]xml.ts` — server route
- `public/robots.txt`
- `src/components/MarkdownEditor.tsx` (admin)
- `src/lib/seo.ts` — helper meta generator

**Edit:**
- `src/routes/__root.tsx` — JSON-LD Person, default og
- `src/routes/index.tsx` — head() meta, mobile spacing fix, lazy load
- `src/routes/admin.tsx` — nav link Blog
- `src/components/ImageUpload.tsx` — WebP conversion
- `src/styles.css` — font-display swap, mobile spacing tokens

**Dependency baru:** `react-markdown`, `remark-gfm`

---

## Urutan eksekusi

1. Migration tabel `posts` + seed dummy data semua tabel
2. Blog routes + admin CRUD
3. SEO: head() per route + sitemap + JSON-LD
4. Mobile polish (review section by section)
5. Performa: WebP, preload, lazy load
6. QA akhir di viewport HP

Estimasi: cukup besar, mungkin perlu split jadi 2 batch (Blog+SEO dulu, lalu Mobile+Performa+Seed). Mau aku kerjain sekaligus atau pisah?
