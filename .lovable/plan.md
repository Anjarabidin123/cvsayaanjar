
# Rombak CV — Heritage Modern (Light + Indigo)

## Arah desain baru

Bukan dark mode lagi. Tema **kertas krem-putih** dengan aksen **Indigo Nusantara** (#1e3a5f) dan emas hangat (#c9a84c). Hasilnya: bersih, profesional, mudah dibaca di HP, tapi tetap punya jiwa Indonesia.

Motif batik diganti dengan **ornamen Nusantara yang lebih elegan & subtle**:
- **Ukiran sulur Jepara** sebagai pembatas section (garis tipis emas)
- **Siluet Gunungan Wayang** sebagai ornamen pojok hero & footer
- **Pola tenun ikat geometris** tipis di latar (jauh lebih halus dari batik sekarang)
- Semua ornamen monokrom indigo/emas dengan opacity 6–10% — terasa, tidak mengganggu

## Yang akan ditambahkan

| Fitur | Detail |
|---|---|
| **Download CV (PDF)** | Tombol di hero. Generate PDF on-the-fly dari data Supabase (server function + pdf-lib), layout 1 halaman A4 profesional |
| **Section Pendidikan** | Tabel `education` baru: institusi, jurusan, gelar, tahun, deskripsi. CRUD admin lengkap |
| **Section Testimoni** | Tabel `testimonials` baru: nama, jabatan, perusahaan, foto, kutipan, rating. Tampil sebagai carousel |
| **Form Kontak** | Form di section terakhir. Tabel `messages` simpan inbox. Validasi Zod (name/email/message, length limits). Admin bisa lihat pesan masuk di `/admin/messages` |
| **Multi-bahasa ID/EN** | Toggle 🇮🇩/🇬🇧 di nav. Pakai context sederhana + dictionary JSON. Konten dinamis (bio, deskripsi) opsional dual-field: `bio` + `bio_en` |
| **Bonus yang cocok** | **Hero stats counter** (tahun pengalaman, proyek selesai, sertifikat — animated count-up) + **Floating action button** ke WhatsApp/LinkedIn |

## Struktur halaman publik (urutan baru)

```
Nav (logo • menu • toggle bahasa • Download CV)
─────────────────────────────
1. Hero          — nama, title, bio, stats counter, CTA
2. Pengalaman    — timeline modern
3. Pendidikan    — kartu sederhana          ← BARU
4. Proyek        — grid showcase
5. Keahlian      — progress bars
6. Sertifikat    — kartu
7. Testimoni     — carousel                  ← BARU
8. Kontak        — form + info kontak        ← BARU
Footer (ornamen gunungan + social)
```

## Perubahan teknis

**Database (migration baru):**
- `education` (institution, degree, field, start_year, end_year, description, display_order)
- `testimonials` (name, role, company, avatar_url, quote, rating, display_order)
- `messages` (name, email, subject, message, is_read, created_at) — RLS: anyone insert, admin read

**Admin routes baru:**
- `/admin/education`
- `/admin/testimonials`
- `/admin/messages` (inbox, mark as read, hapus)

**Komponen baru:**
- `src/components/NusantaraOrnament.tsx` (gantikan `BatikPattern.tsx` — sulur, gunungan, tenun)
- `src/components/LanguageToggle.tsx` + `src/lib/i18n.ts` (dictionary ID/EN)
- `src/components/StatsCounter.tsx` (animated count-up via framer-motion)
- `src/components/TestimonialCarousel.tsx`
- `src/components/ContactForm.tsx` (Zod-validated)
- `src/components/DownloadCVButton.tsx`

**Server function baru:**
- `src/lib/cv-pdf.functions.ts` — generate PDF pakai `pdf-lib` (Worker-compatible). Layout 1 halaman: header nama+kontak, kolom kiri (skills + pendidikan), kolom kanan (pengalaman + proyek pilihan)

**Styling (`src/styles.css`):**
- Reset palette ke light mode: bg `oklch(0.99 0 0)`, foreground indigo gelap, primary indigo `#1e3a5f`, accent gold `#c9a84c`
- Tetap Playfair Display + Karla (cocok untuk light theme)
- Bukan `dark` class — pure light

**File yang dihapus:**
- `src/components/BatikPattern.tsx` (diganti `NusantaraOrnament.tsx`)

## Catatan untuk Anda

- Tema dark sekarang akan **diganti total** ke light mode. Kalau nanti mau toggle dark/light bisa ditambahkan, tapi default light.
- Multi-bahasa: label UI (nav, judul section, tombol) di-translate via dictionary. Konten yang Anda isi sendiri (bio, deskripsi proyek) tetap satu bahasa — kecuali Anda mau saya tambahkan field `_en` untuk tiap konten (lebih ribet tapi lebih lengkap). **Bisa saya konfirmasi setelah plan disetujui.**
- Form kontak menyimpan ke database, tidak kirim email (untuk kirim email butuh setup Resend — bisa ditambahkan terpisah kalau perlu).
