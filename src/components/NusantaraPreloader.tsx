import { useEffect, useRef, useState } from "react";

/** 
 * Preloader Nusantara "Tech-Constellation"
 * Modern, tidak polos, penuh animasi dinamis (Plexus particles, 3D Orbital Rings, Booting Sequence).
 */
export function NusantaraPreloader({ onFinished }: { onFinished: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [progress, setProgress] = useState(0);
  const [bootText, setBootText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bootSequence = [
    "INITIALIZING KINETIC SYSTEM...",
    "LOADING NUSANTARA ASSETS...",
    "RENDERING GLASSMORPHISM...",
    "ESTABLISHING CONNECTION...",
    "OPTIMIZING PERFORMANCE...",
    "SYSTEM READY."
  ];

  /* ── Boot Text & Progress Logic ── */
  useEffect(() => {
    let p = 0;
    let step = 0;
    const bootInterval = setInterval(() => {
      setBootText(bootSequence[step % bootSequence.length]);
      step++;
    }, 600);

    const progressInterval = setInterval(() => {
      p += Math.random() * 5 + 1;
      if (p >= 100) { 
        p = 100; 
        clearInterval(progressInterval); 
        clearInterval(bootInterval);
        setBootText("SYSTEM READY.");
      }
      setProgress(Math.min(p, 100));
    }, 60);

    return () => { clearInterval(progressInterval); clearInterval(bootInterval); };
  }, []);

  /* ── Phase control ── */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => setPhase("out"), 3200);
    const t3 = setTimeout(() => onFinished(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinished]);

  /* ── Plexus / Constellation Canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const cv = canvas;
    let rafId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1,
    }));

    function render() {
      ctx.clearRect(0, 0, cv.width, cv.height);

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > cv.width) p.vx *= -1;
        if (p.y < 0 || p.y > cv.height) p.vy *= -1;

        // Draw dot
        ctx.fillStyle = "rgba(220, 180, 100, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Check connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.strokeStyle = `rgba(220, 180, 100, ${0.3 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#070709", // Sangat gelap dengan hint biru/espresso
        backgroundImage: "radial-gradient(circle at 50% 50%, #1a1208 0%, #070709 80%)",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
        pointerEvents: phase === "out" ? "none" : "all",
      }}
    >
      {/* Background Plexus */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, opacity: 0.6 }} />

      {/* Cyber Grid Background */}
      <div 
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(200, 160, 60, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 160, 60, 0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(500px) rotateX(60deg) translateY(-100px)",
          transformOrigin: "center top",
          animation: "grid-move 10s linear infinite",
          opacity: 0.4
        }} 
      />

      {/* Main Content wrapper */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "scale(0.85) translateY(30px)" : "scale(1) translateY(0)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* 3D Orbital Rings (High-Tech Nusantara Motif) */}
        <div style={{ position: "relative", width: "160px", height: "160px", marginBottom: "40px", perspective: "800px" }}>
          
          {/* Circular Progress Ring */}
          <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)", filter: "drop-shadow(0 0 8px rgba(220,180,100,0.5))" }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <circle 
              cx="50" cy="50" r="48" 
              fill="none" 
              stroke="#f0c060" 
              strokeWidth="2" 
              strokeDasharray={`${(progress / 100) * 301} 301`} 
              strokeLinecap="round" 
              style={{ transition: "stroke-dasharray 0.1s ease" }}
            />
          </svg>

          {/* 3D Spinning Orbits */}
          <div style={{ position: "absolute", inset: 10, border: "1px dashed rgba(220,180,100,0.4)", borderRadius: "50%", animation: "orbit-spin-x 4s linear infinite" }} />
          <div style={{ position: "absolute", inset: 15, border: "2px solid rgba(220,180,100,0.1)", borderRadius: "50%", animation: "orbit-spin-y 6s linear infinite" }} />
          <div style={{ position: "absolute", inset: 25, border: "1px solid rgba(220,180,100,0.2)", borderRadius: "50%", animation: "orbit-spin-z 5s linear infinite" }}>
            <div style={{ position: "absolute", top: -3, left: "50%", width: 6, height: 6, background: "#fff", borderRadius: "50%", boxShadow: "0 0 10px #fff" }} />
          </div>

          {/* Center Glowing Element (Tech Gunungan) */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            animation: "pulse-glow 2s ease-in-out infinite alternate",
            display: "flex", justifyContent: "center", alignItems: "center"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 22H22L12 2Z" stroke="#f0c060" strokeWidth="1.5" fill="rgba(220,180,100,0.15)" strokeLinejoin="round" />
              <path d="M12 8L6 18H18L12 8Z" stroke="#ffffff" strokeWidth="1" fill="rgba(255,255,255,0.1)" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Text Area */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1
            style={{
              fontFamily: "'Karla', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#ffffff",
              margin: 0,
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(220,180,100,0.5)"
            }}
          >
            Anjar Abidin
          </h1>
          
          <p
            style={{
              fontFamily: "'Karla', sans-serif",
              fontSize: "13px",
              letterSpacing: "0.4em",
              color: "#f0c060",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Digital Portfolio
          </p>

          {/* Dynamic Boot Sequence Text */}
          <div style={{ 
            marginTop: "24px",
            fontFamily: "monospace", 
            fontSize: "11px", 
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            height: "16px",
            position: "relative",
            overflow: "hidden",
            width: "280px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px" }}>
              <span>{bootText}</span>
              <span>[{Math.floor(progress)}%]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Overlay Effects */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", animation: "scanline 8s linear infinite", background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.05) 50%)", backgroundSize: "100% 4px" }} />

      {/* Embedded CSS */}
      <style>{`
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes orbit-spin-x {
          0% { transform: rotateX(70deg) rotateZ(0deg); }
          100% { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes orbit-spin-y {
          0% { transform: rotateY(70deg) rotateX(45deg) rotateZ(0deg); }
          100% { transform: rotateY(70deg) rotateX(45deg) rotateZ(360deg); }
        }
        @keyframes orbit-spin-z {
          0% { transform: rotateZ(0deg) rotateX(-60deg); }
          100% { transform: rotateZ(360deg) rotateX(-60deg); }
        }
        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 10px rgba(240,192,96,0.4)); transform: translate(-50%, -50%) scale(0.9); }
          100% { filter: drop-shadow(0 0 25px rgba(240,192,96,0.8)); transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
