import type { PortfolioData } from "./portfolio-updates";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const SIDEBAR_W = 205;
const MAIN_X = 228;
const MAIN_W = PAGE_W - MAIN_X - 34;
const SIDE_X = 24;
const SIDE_W = SIDEBAR_W - 44;
const BOTTOM_MARGIN = 46;

type FontKey = "F1" | "F2" | "F3"; // Regular, Bold, Italic

function sanitizeWinAnsi(text: string): string {
  return text
    .replace(/\t+/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2022/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

function escapePdfString(text: string): string {
  return sanitizeWinAnsi(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function approxCharWidth(ch: string, fontSize: number, bold: boolean): number {
  let ratio = 0.52;
  if ("ilIjtf.,:;!'| ".includes(ch)) ratio = 0.28;
  else if ("mwMW@#%&".includes(ch)) ratio = 0.82;
  else if (ch >= "A" && ch <= "Z") ratio = 0.66;
  else if (ch >= "0" && ch <= "9") ratio = 0.56;
  return fontSize * ratio * (bold ? 1.05 : 1.0);
}

function wrapText(text: string, maxWidth: number, fontSize: number, bold = false): string[] {
  const clean = sanitizeWinAnsi(text);
  if (!clean) return [];
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";
  let currentW = 0;
  const spaceW = approxCharWidth(" ", fontSize, bold);

  for (const word of words) {
    let wordW = 0;
    for (let i = 0; i < word.length; i++) {
      wordW += approxCharWidth(word[i], fontSize, bold);
    }

    if (!current) {
      current = word;
      currentW = wordW;
    } else if (currentW + spaceW + wordW <= maxWidth) {
      current += " " + word;
      currentW += spaceW + wordW;
    } else {
      lines.push(current);
      current = word;
      currentW = wordW;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function formatMonthYearShort(d: string, lang: "id" | "en"): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
  });
}

function parseBulletLines(description: string): string[] {
  return description
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[•\-*\t]+\s*/, "").trim())
    .filter(Boolean);
}

function parseEducationDesc(desc: string): string {
  if (!desc) return "";
  return desc.split("||logo:")[0] ?? "";
}

async function loadCircularAvatarJpeg(url: string): Promise<{ bytes: Uint8Array; size: number } | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image load failed"));
      image.src = url;
    });

    const size = 280;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fill with sidebar background color so circular edges blend seamlessly
    ctx.fillStyle = "#F3F1ED";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const dx = (size - drawW) / 2;
    const dy = (size - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();

    // Subtle accent ring
    ctx.strokeStyle = "#D4CFC7";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { bytes, size };
  } catch {
    return null;
  }
}

class PdfPageBuilder {
  private pages: string[][] = [];
  private currentIdx = -1;

  constructor() {
    this.addPage();
  }

  addPage(): number {
    const ops: string[] = [
      // Sidebar background (#F3F1ED)
      `0.953 0.945 0.929 rg 0 0 ${SIDEBAR_W.toFixed(2)} ${PAGE_H.toFixed(2)} re f`,
      // Vertical divider line
      `0.85 0.82 0.78 RG 0.75 w ${SIDEBAR_W.toFixed(2)} 0 m ${SIDEBAR_W.toFixed(2)} ${PAGE_H.toFixed(2)} l S`,
    ];
    this.pages.push(ops);
    this.currentIdx = this.pages.length - 1;
    return this.currentIdx;
  }

  usePage(idx: number) {
    this.currentIdx = idx;
  }

  getPageCount(): number {
    return this.pages.length;
  }

  drawText(
    text: string,
    x: number,
    y: number,
    size: number,
    font: FontKey = "F1",
    color: [number, number, number] = [0.16, 0.15, 0.14]
  ) {
    const escaped = escapePdfString(text);
    if (!escaped) return;
    this.pages[this.currentIdx].push(
      `BT /${font} ${size.toFixed(2)} Tf ${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escaped}) Tj ET`
    );
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [0.78, 0.75, 0.71], width = 0.75) {
    this.pages[this.currentIdx].push(
      `${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} RG ${width.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    );
  }

  drawCircle(cx: number, cy: number, r: number, color: [number, number, number] = [0.706, 0.353, 0.196]) {
    const k = 0.5522847498 * r;
    const ops = [
      `${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} rg`,
      `${(cx + r).toFixed(2)} ${cy.toFixed(2)} m`,
      `${(cx + r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c`,
      `${(cx - k).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c`,
      `${(cx - r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c`,
      `${(cx + k).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c f`,
    ];
    this.pages[this.currentIdx].push(ops.join(" "));
  }

  drawImage(name: string, x: number, y: number, w: number, h: number) {
    this.pages[this.currentIdx].push(
      `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /${name} Do Q`
    );
  }

  getPageStreams(): string[] {
    return this.pages.map((ops) => ops.join("\n"));
  }
}

function stringToLatin1Bytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function buildPdfBlob(streams: string[], avatar: { bytes: Uint8Array; size: number } | null): Blob {
  // Object numbers:
  // 1: Catalog
  // 2: Pages
  // 3: Font F1 (Helvetica)
  // 4: Font F2 (Helvetica-Bold)
  // 5: Font F3 (Helvetica-Oblique)
  // 6: (optional) Image Im1
  // Subsequent pairs: Page, Contents
  const hasImage = Boolean(avatar);
  const firstPageObjId = hasImage ? 7 : 6;
  const pageObjIds: number[] = [];
  for (let i = 0; i < streams.length; i++) {
    pageObjIds.push(firstPageObjId + i * 2);
  }

  const parts: Uint8Array[] = [];
  const offsets: number[] = [0]; // 1-based later
  let cursor = 0;

  const pushBytes = (b: Uint8Array) => {
    parts.push(b);
    cursor += b.length;
  };
  const pushStr = (s: string) => pushBytes(stringToLatin1Bytes(s));

  const startObj = (id: number) => {
    offsets[id] = cursor;
    pushStr(`${id} 0 obj\n`);
  };
  const endObj = () => pushStr("\nendobj\n");

  pushStr("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  startObj(1);
  pushStr(`<< /Type /Catalog /Pages 2 0 R >>`);
  endObj();

  startObj(2);
  pushStr(`<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>`);
  endObj();

  startObj(3);
  pushStr(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  endObj();

  startObj(4);
  pushStr(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
  endObj();

  startObj(5);
  pushStr(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`);
  endObj();

  if (avatar) {
    startObj(6);
    pushStr(
      `<< /Type /XObject /Subtype /Image /Width ${avatar.size} /Height ${avatar.size} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${avatar.bytes.length} >>\nstream\n`
    );
    pushBytes(avatar.bytes);
    pushStr("\nendstream");
    endObj();
  }

  const xObjEntry = hasImage ? " /XObject << /Im1 6 0 R >>" : "";
  const resources = `<< /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>${xObjEntry} >>`;

  for (let i = 0; i < streams.length; i++) {
    const pageId = firstPageObjId + i * 2;
    const contentId = pageId + 1;
    const streamBytes = stringToLatin1Bytes(streams[i]);

    startObj(pageId);
    pushStr(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Resources ${resources} /Contents ${contentId} 0 R >>`
    );
    endObj();

    startObj(contentId);
    pushStr(`<< /Length ${streamBytes.length} >>\nstream\n`);
    pushBytes(streamBytes);
    pushStr("\nendstream");
    endObj();
  }

  const xrefOffset = cursor;
  const totalObjs = firstPageObjId + streams.length * 2;
  pushStr(`xref\n0 ${totalObjs}\n`);
  pushStr("0000000000 65535 f \n");
  for (let id = 1; id < totalObjs; id++) {
    const off = String(offsets[id]).padStart(10, "0");
    pushStr(`${off} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const blobParts: BlobPart[] = parts.map((p) => {
    const copy = new Uint8Array(p.byteLength);
    copy.set(p);
    return copy;
  });
  return new Blob(blobParts, { type: "application/pdf" });
}

/**
 * Generates an up-to-date PDF CV directly from the live portfolio data
 * (profile, avatar, experiences, education, skills) and triggers download.
 */
export async function downloadGeneratedCV(data: PortfolioData, lang: "id" | "en") {
  const { profile, experiences, education, skills } = data;
  const isId = lang === "id";
  const accent: [number, number, number] = [0.706, 0.353, 0.196];
  const dark: [number, number, number] = [0.15, 0.14, 0.13];
  const muted: [number, number, number] = [0.42, 0.40, 0.37];

  const avatar = profile?.avatar_url ? await loadCircularAvatarJpeg(profile.avatar_url) : null;
  const pdf = new PdfPageBuilder();

  // --- LEFT SIDEBAR (Page 1) ---
  let sideY = PAGE_H - 42;
  if (avatar) {
    const imgSize = 104;
    const imgX = (SIDEBAR_W - imgSize) / 2;
    pdf.drawImage("Im1", imgX, sideY - imgSize, imgSize, imgSize);
    sideY -= imgSize + 24;
  }

  const drawSideHeading = (title: string) => {
    pdf.drawText(title, SIDE_X, sideY, 10, "F2", dark);
    sideY -= 5;
    pdf.drawLine(SIDE_X, sideY, SIDEBAR_W - 20, sideY, accent, 1.0);
    sideY -= 15;
  };

  if (profile?.bio) {
    drawSideHeading(isId ? "RINGKASAN PROFESIONAL" : "PROFESSIONAL SUMMARY");
    const bioLines = wrapText(profile.bio, SIDE_W, 8.8, false);
    for (const line of bioLines) {
      if (sideY < BOTTOM_MARGIN) break;
      pdf.drawText(line, SIDE_X, sideY, 8.8, "F1", dark);
      sideY -= 12.5;
    }
    sideY -= 14;
  }

  if (skills.length > 0 && sideY > BOTTOM_MARGIN + 30) {
    drawSideHeading(isId ? "KETERAMPILAN" : "SKILLS");
    for (const sk of skills) {
      if (sideY < BOTTOM_MARGIN) break;
      pdf.drawText(`- ${sk.name}`, SIDE_X, sideY, 8.8, "F1", dark);
      sideY -= 13;
    }
    sideY -= 14;
  }

  const sl = (profile?.social_links ?? {}) as Record<string, string | undefined>;
  const socialEntries = [
    ["GitHub", sl.github],
    ["LinkedIn", sl.linkedin],
    ["Instagram", sl.instagram],
  ].filter(([, url]) => Boolean(url)) as [string, string][];

  if (socialEntries.length > 0 && sideY > BOTTOM_MARGIN + 30) {
    drawSideHeading(isId ? "TAUTAN SOSIAL" : "SOCIAL LINKS");
    for (const [label, url] of socialEntries) {
      if (sideY < BOTTOM_MARGIN + 14) break;
      pdf.drawText(`${label}:`, SIDE_X, sideY, 8.2, "F2", dark);
      sideY -= 10.5;
      const urlLines = wrapText(url, SIDE_W, 7.6, false);
      for (const ul of urlLines) {
        if (sideY < BOTTOM_MARGIN) break;
        pdf.drawText(ul, SIDE_X, sideY, 7.6, "F1", muted);
        sideY -= 10;
      }
      sideY -= 5;
    }
  }

  // --- RIGHT MAIN COLUMN (Multi-page aware) ---
  pdf.usePage(0);
  let mainPageIdx = 0;
  let mainY = PAGE_H - 52;

  const ensureMainSpace = (neededHeight: number) => {
    if (mainY - neededHeight >= BOTTOM_MARGIN) return;
    mainPageIdx += 1;
    if (mainPageIdx >= pdf.getPageCount()) {
      pdf.addPage();
    } else {
      pdf.usePage(mainPageIdx);
    }
    mainY = PAGE_H - 48;
  };

  // Header
  const fullName = (profile?.full_name || "Curriculum Vitae").toUpperCase();
  const nameLines = wrapText(fullName, MAIN_W, 20, true);
  for (const nl of nameLines) {
    pdf.drawText(nl, MAIN_X, mainY, 20, "F2", dark);
    mainY -= 23;
  }
  if (profile?.title) {
    pdf.drawText(profile.title.toUpperCase(), MAIN_X, mainY, 10.5, "F2", accent);
    mainY -= 16;
  }

  const contactBits = [profile?.location, profile?.email, sl.whatsapp].filter(Boolean).join("  |  ");
  if (contactBits) {
    const cLines = wrapText(contactBits, MAIN_W, 8.5, false);
    for (const cl of cLines) {
      pdf.drawText(cl, MAIN_X, mainY, 8.5, "F1", muted);
      mainY -= 11;
    }
  }
  mainY -= 8;
  pdf.drawLine(MAIN_X, mainY, PAGE_W - 34, mainY, [0.85, 0.82, 0.78], 0.75);
  mainY -= 22;

  const drawMainSectionTitle = (title: string) => {
    ensureMainSpace(36);
    pdf.drawText(title, MAIN_X, mainY, 11, "F2", dark);
    mainY -= 6;
    pdf.drawLine(MAIN_X, mainY, PAGE_W - 34, mainY, accent, 1.1);
    mainY -= 16;
  };

  // Work Experience
  if (experiences.length > 0) {
    drawMainSectionTitle(isId ? "RIWAYAT PEKERJAAN" : "WORK EXPERIENCE");

    for (const exp of experiences) {
      const bullets = parseBulletLines(exp.description);
      const dateStr = `${formatMonthYearShort(exp.start_date, lang)} - ${
        exp.end_date ? formatMonthYearShort(exp.end_date, lang) : isId ? "Sekarang" : "Present"
      }`;
      const headerStr = `${exp.role.toUpperCase()}  |  ${dateStr}`;
      const headerLines = wrapText(headerStr, MAIN_W - 14, 9.5, true);

      // Estimate first-chunk height so header never orphans at page bottom
      ensureMainSpace(headerLines.length * 12 + 28);

      pdf.drawCircle(MAIN_X + 4, mainY + 3, 2.8, accent);
      for (const hl of headerLines) {
        pdf.drawText(hl, MAIN_X + 14, mainY, 9.5, "F2", dark);
        mainY -= 12;
      }

      pdf.drawText(exp.company, MAIN_X + 14, mainY, 8.8, "F3", accent);
      mainY -= 13;

      for (const b of bullets) {
        const bLines = wrapText(b, MAIN_W - 24, 8.6, false);
        ensureMainSpace(bLines.length * 11.5 + 4);
        bLines.forEach((bl, idx) => {
          if (idx === 0) {
            pdf.drawText("-", MAIN_X + 14, mainY, 8.6, "F2", accent);
          }
          pdf.drawText(bl, MAIN_X + 23, mainY, 8.6, "F1", dark);
          mainY -= 11.5;
        });
      }
      mainY -= 9;
    }
  }

  // Education
  if (education.length > 0) {
    mainY -= 4;
    drawMainSectionTitle(isId ? "PENDIDIKAN" : "EDUCATION");

    for (const ed of education) {
      const period = `${ed.start_year ?? "-"} - ${ed.end_year ?? (isId ? "Sekarang" : "Present")}`;
      const degField = [ed.degree, ed.field].filter(Boolean).join(" - ");
      const titleLine = degField ? `${degField.toUpperCase()}  |  ${period}` : period;
      const descText = parseEducationDesc(ed.description);
      const descBullets = parseBulletLines(descText);

      ensureMainSpace(40);
      pdf.drawCircle(MAIN_X + 4, mainY + 3, 2.8, accent);
      pdf.drawText(titleLine, MAIN_X + 14, mainY, 9.5, "F2", dark);
      mainY -= 12;
      pdf.drawText(ed.institution, MAIN_X + 14, mainY, 9, "F3", accent);
      mainY -= 13;

      for (const b of descBullets) {
        const bLines = wrapText(b, MAIN_W - 24, 8.5, false);
        ensureMainSpace(bLines.length * 11.5 + 4);
        bLines.forEach((bl, idx) => {
          if (idx === 0) {
            pdf.drawText("-", MAIN_X + 14, mainY, 8.5, "F2", accent);
          }
          pdf.drawText(bl, MAIN_X + 23, mainY, 8.5, "F1", dark);
          mainY -= 11.5;
        });
      }
      mainY -= 8;
    }
  }

  const blob = buildPdfBlob(pdf.getPageStreams(), avatar);
  const safeName = (profile?.full_name ?? "CV")
    .trim()
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .replace(/\s+/g, "-");
  const filename = `CV-${safeName || "Portfolio"}-${lang.toUpperCase()}.pdf`;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
}
