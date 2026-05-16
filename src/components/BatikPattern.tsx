import { type CSSProperties } from "react";

/**
 * Batik-inspired SVG patterns. These are abstract interpretations of
 * Indonesian motifs (Kawung, Parang, Truntum) — not literal reproductions.
 */

type Props = {
  variant?: "kawung" | "parang" | "truntum";
  className?: string;
  style?: CSSProperties;
  opacity?: number;
};

export function BatikPattern({ variant = "kawung", className, style, opacity = 0.15 }: Props) {
  const id = `batik-${variant}`;
  return (
    <svg
      aria-hidden
      className={className}
      style={{ opacity, ...style }}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {variant === "kawung" && <KawungDef id={id} />}
        {variant === "parang" && <ParangDef id={id} />}
        {variant === "truntum" && <TruntumDef id={id} />}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function KawungDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" strokeWidth="0.8">
        <ellipse cx="20" cy="20" rx="14" ry="9" transform="rotate(45 20 20)" />
        <ellipse cx="60" cy="20" rx="14" ry="9" transform="rotate(-45 60 20)" />
        <ellipse cx="20" cy="60" rx="14" ry="9" transform="rotate(-45 20 60)" />
        <ellipse cx="60" cy="60" rx="14" ry="9" transform="rotate(45 60 60)" />
        <circle cx="40" cy="40" r="2.5" fill="currentColor" />
        <circle cx="0" cy="0" r="2" fill="currentColor" />
        <circle cx="80" cy="0" r="2" fill="currentColor" />
        <circle cx="0" cy="80" r="2" fill="currentColor" />
        <circle cx="80" cy="80" r="2" fill="currentColor" />
      </g>
    </pattern>
  );
}

function ParangDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M0 15 Q 15 0 30 15 T 60 15" />
        <path d="M0 35 Q 15 20 30 35 T 60 35" />
        <path d="M0 55 Q 15 40 30 55 T 60 55" />
        <circle cx="15" cy="25" r="1.5" fill="currentColor" />
        <circle cx="45" cy="25" r="1.5" fill="currentColor" />
        <circle cx="15" cy="45" r="1.5" fill="currentColor" />
        <circle cx="45" cy="45" r="1.5" fill="currentColor" />
      </g>
    </pattern>
  );
}

function TruntumDef({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" strokeWidth="0.7">
        {[0, 90, 180, 270].map((r) => (
          <path key={r} d="M25 25 L25 8 M22 12 L25 8 L28 12" transform={`rotate(${r} 25 25)`} />
        ))}
        <circle cx="25" cy="25" r="3" fill="currentColor" />
        <circle cx="0" cy="0" r="1.2" fill="currentColor" />
        <circle cx="50" cy="0" r="1.2" fill="currentColor" />
        <circle cx="0" cy="50" r="1.2" fill="currentColor" />
        <circle cx="50" cy="50" r="1.2" fill="currentColor" />
      </g>
    </pattern>
  );
}