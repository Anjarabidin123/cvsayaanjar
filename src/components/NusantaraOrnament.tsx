import type { CSSProperties } from "react";

/**
 * Ornamen Nusantara — interpretasi modern ukiran sulur, gunungan wayang,
 * dan pola tenun ikat. Monokrom, untuk dipakai sebagai aksen tipis.
 */

type PatternProps = {
  variant?: "sulur" | "tenun" | "kawung-mini" | "parang" | "truntum" | "patra";
  className?: string;
  style?: CSSProperties;
  opacity?: number;
};

export function NusantaraPattern({ variant = "tenun", className, style, opacity = 0.08 }: PatternProps) {
  const id = `nu-${variant}`;
  return (
    <svg aria-hidden className={className} style={{ opacity, ...style }} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {variant === "sulur" && <SulurDef id={id} />}
        {variant === "tenun" && <TenunDef id={id} />}
        {variant === "kawung-mini" && <KawungMiniDef id={id} />}
        {variant === "parang" && <ParangDef id={id} />}
        {variant === "truntum" && <TruntumDef id={id} />}
        {variant === "patra" && <PatraDef id={id} />}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function SulurDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M0 30 Q 30 0 60 30 T 120 30" />
        <path d="M15 30 Q 20 20 30 22 Q 25 28 15 30" />
        <path d="M45 30 Q 50 40 60 38 Q 55 32 45 30" />
        <path d="M75 30 Q 80 20 90 22 Q 85 28 75 30" />
        <path d="M105 30 Q 110 40 120 38" />
      </g>
    </pattern>
  );
}

function TenunDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M0 20 L20 0 L40 20 L20 40 Z" />
        <path d="M10 20 L20 10 L30 20 L20 30 Z" />
        <circle cx="20" cy="20" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="0" cy="0" r="1" fill="currentColor" stroke="none" />
        <circle cx="40" cy="0" r="1" fill="currentColor" stroke="none" />
        <circle cx="0" cy="40" r="1" fill="currentColor" stroke="none" />
        <circle cx="40" cy="40" r="1" fill="currentColor" stroke="none" />
      </g>
    </pattern>
  );
}

function KawungMiniDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" strokeWidth="0.5">
        <ellipse cx="9" cy="9" rx="6" ry="4" transform="rotate(45 9 9)" />
        <ellipse cx="27" cy="9" rx="6" ry="4" transform="rotate(-45 27 9)" />
        <ellipse cx="9" cy="27" rx="6" ry="4" transform="rotate(-45 9 27)" />
        <ellipse cx="27" cy="27" rx="6" ry="4" transform="rotate(45 27 27)" />
        <circle cx="18" cy="18" r="1" fill="currentColor" stroke="none" />
      </g>
    </pattern>
  );
}

function ParangDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20,0 C35,10 5,30 20,40" />
        <path d="M60,0 C75,10 45,30 60,40" />
        <path d="-20,0 C-5,10 -35,30 -20,40" />
        <polygon points="40,20 45,25 40,30 35,25" fill="currentColor" stroke="none" />
        <polygon points="0,20 5,25 0,30 -5,25" fill="currentColor" stroke="none" />
      </g>
    </pattern>
  );
}

function TruntumDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="30" cy="30" r="2" fill="currentColor" stroke="none" />
        <path d="M30,22 L30,38 M22,30 L38,30 M24,24 L36,36 M24,36 L36,24" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="60" cy="60" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="60" cy="0" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="0" cy="60" r="1.5" fill="currentColor" stroke="none" />
        <path d="M0,8 Q5,5 8,0 M60,8 Q55,5 52,0" strokeWidth="0.8" />
      </g>
    </pattern>
  );
}

function PatraDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M40,40 C 40,20 60,20 60,40 C 60,55 45,55 45,45 C 45,38 52,38 52,43" />
        <path d="M40,40 C 40,60 20,60 20,40 C 20,25 35,25 35,35 C 35,42 28,42 28,37" />
        <path d="M60,40 Q 75,30 80,10 Q 60,15 40,40" />
        <path d="M20,40 Q 5,50 0,70 Q 20,65 40,40" />
        <circle cx="75" cy="20" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="5" cy="60" r="1.5" fill="currentColor" stroke="none" />
      </g>
    </pattern>
  );
}

/** Siluet Gunungan Wayang — ornamen pojok */
export function GununganOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M40 4 L48 14 L46 22 L52 26 L48 34 L56 38 L52 48 L60 54 L54 64 L64 72 L56 82 L66 90 L52 96 L60 110 L40 116 L20 110 L28 96 L14 90 L24 82 L16 72 L26 64 L20 54 L28 48 L24 38 L32 34 L28 26 L34 22 L32 14 Z" />
      <circle cx="40" cy="56" r="6" />
      <circle cx="40" cy="56" r="2" fill="currentColor" />
      <path d="M30 78 Q 40 84 50 78" />
      <path d="M28 88 Q 40 96 52 88" />
    </svg>
  );
}

/** Glyph kecil — bunga Truntum stylized untuk navigasi & footer */
export function NusantaraGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="12" cy="7" rx="2" ry="3.5" transform={`rotate(${r} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Pembatas sulur horizontal */
export function SulurDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden preserveAspectRatio="xMidYMid meet">
      <path d="M0 10 Q 30 0 60 10 T 120 10 T 200 10" />
      <circle cx="100" cy="10" r="2.5" fill="currentColor" />
      <circle cx="60" cy="10" r="1.5" fill="currentColor" />
      <circle cx="140" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}