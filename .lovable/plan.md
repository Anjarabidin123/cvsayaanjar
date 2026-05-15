# Plan: Portfolio CV dengan Admin Panel

## Ringkasan
Website portfolio CV profesional dengan tampilan elegan, menampilkan profil, pengalaman, proyek, dan skill. Dilengkapi halaman admin terlindungi (login) untuk mengelola semua konten secara dinamis melalui database.

---

## Tumpukan Teknologi

| Lapisan | Pilihan |
|---------|---------|
| Framework | TanStack Start (React + SSR) |
| Styling | Tailwind CSS v4 |
| Database & Auth | Lovable Cloud (Supabase) |
| Query | TanStack React Query |
| Animasi | Framer Motion |
| Font | Cormorant + Karla (elegan & profesional) |
| Palette | Noir & Gold (mewah, editorial) |

---

## Skema Database

### `profiles`
| Field | Tipe | Catatan |
|-------|------|---------|
| id | uuid (PK) | — |
| full_name | text | Nama lengkap |
| title | text | Jabatan / headline |
| bio | text | Deskripsi singkat |
| email | text | Kontak |
| location | text | Lokasi |
| avatar_url | text | URL foto |
| social_links | jsonb | { linkedin, github, twitter } |

### `experiences`
| Field | Tipe | Catatan |
|-------|------|---------|
| id | uuid (PK) | — |
| company | text | Nama perusahaan |
| role | text | Posisi |
| start_date | date | — |
| end_date | date | null = masih aktif |
| description | text | Deskripsi pekerjaan |
| order | int | Urutan tampilan |

### `projects`
| Field | Tipe | Catatan |
|-------|------|---------|
| id | uuid (PK) | — |
| title | text | Nama proyek |
| description | text | Deskripsi |
| technologies | text[] | Array teknologi |
| live_url | text | Link demo |
| repo_url | text | Link repo |
| image_url | text | Screenshot proyek |
| order | int | Urutan tampilan |

### `skills`
| Field | Tipe | Catatan |
|-------|------|---------|
| id | uuid (PK) | — |
| category | text | Kategori: Frontend, Backend, Tools, dll |
| name | text | Nama skill |
| proficiency | int | 0-100 |
| order | int | Urutan tampilan |

### `user_roles`
| Field | Tipe | Catatan |
|-------|------|---------|
| id | uuid (PK) | — |
| user_id | uuid FK auth.users | — |
| role | enum (admin, editor) | — |

---

## Struktur Halaman

### Halaman Publik
1. **Homepage ( `/` )**
   - Hero: Nama, title, bio singkat, CTA ke proyek
   - Section Pengalaman: Timeline vertikal
   - Section Proyek: Grid card dengan thumbnail, tech stack, link
   - Section Skill: Kategori dengan progress bar
   - Footer: Kontak & social links

2. **Project Detail ( `/project/$id` )**
   - Halaman detail opsional untuk setiap proyek

### Halaman Admin
1. **Login ( `/login` )**
   - Form email + password (Supabase Auth)

2. **Admin Dashboard ( `/admin` )**
   - Ringkasan statistik (total proyek, pengalaman, skill)
   - Navigasi ke sub-halaman kelola konten

3. **Kelola Profil ( `/admin/profile` )**
   - Form edit data pribadi, bio, kontak, social links

4. **Kelola Pengalaman ( `/admin/experiences` )**
   - CRUD pengalaman kerja dengan drag/urutkan

5. **Kelola Proyek ( `/admin/projects` )**
   - CRUD proyek: upload gambar, input teknologi, link

6. **Kelola Skill ( `/admin/skills` )**
   - CRUD skill: kategori, nama, level proficiency

---

## Keamanan & RLS

- **RLS aktif** di semua tabel.
- **Select**: publik (siapa pun bisa baca CV).
- **Insert/Update/Delete**: hanya user dengan role `admin`.
- Fungsi `has_role()` dengan `security definer` untuk mencegah recursive RLS.
- Middleware `requireSupabaseAuth` pada semua server function admin.

---

## Desain

- Tema gelap dominan (`#0d0d0d`, `#1a1a1a`) dengan aksen emas (`#c9a84c`).
- Tipografi elegan: Cormorant untuk heading, Karla untuk body.
- Komposisi: asimetris, whitespace tegas, elemen tipografi besar sebagai visual.
- Animasi: fade-in scroll (Framer Motion), hover state halus.
- Layout: single-page scroll untuk publik, dashboard terpisah untuk admin.

---

## Langkah Implementasi

1. **Persiapan Infrastruktur**
   - Aktifkan Lovable Cloud (Supabase).
   - Buat tabel `profiles`, `experiences`, `projects`, `skills`, `user_roles` dengan RLS.
   - Buat enum `app_role`, fungsi `has_role()`.

2. **Konfigurasi Proyek**
   - Sesuaikan `src/styles.css` dengan palette Noir & Gold.
   - Daftarkan font Cormorant & Karla via Google Fonts.
   - Periksa `src/start.ts` memiliki `attachSupabaseAuth` di `functionMiddleware`.

3. **Autentikasi**
   - Buat route `/login` dengan Supabase Auth (email/password).
   - Buat layout `_authenticated` dengan redirect ke login.

4. **Data Layer (Server Functions)**
   - Buat server function untuk CRUD masing-masing tabel.
   - Semua fungsi write dilindungi `requireSupabaseAuth` + cek `has_role()`.
   - Fungsi read untuk publik (tanpa auth).

5. **UI Publik (Homepage)**
   - Hero section dengan animasi fade-in.
   - Section pengalaman (timeline vertikal).
   - Section proyek (grid card, tech tags, link).
   - Section skill (kategori + progress bar).
   - Footer kontak.

6. **UI Admin**
   - Dashboard overview card.
   - Form CRUD untuk masing-masing entitas.
   - Image upload via Supabase Storage.
   - Drag-to-reorder untuk urutan tampilan (optional v1: manual input `order`).

7. **SEO & Polish**
   - Set `head()` pada root dan halaman publik.
   - Meta description, Open Graph, favicon.
   - Mobile responsive.

## Hasil Akhir
Website portfolio single-page elegan yang bisa Anda kelola sendiri: login ke `/admin` dan edit CV tanpa perlu kode.