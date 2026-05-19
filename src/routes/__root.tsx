import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NusantaraPreloader } from "@/components/NusantaraPreloader";
import { NusantaraPattern, GununganOrnament, NusantaraGlyph, SulurDivider } from "@/components/NusantaraOrnament";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden select-none">
      {/* Dynamic Background Watermarks */}
      <div className="absolute inset-0 pointer-events-none">
        <NusantaraPattern variant="truntum" className="text-accent/5 dark:text-accent/3 w-full h-full" opacity={0.06} />
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Decorative Gunungan Corner Ornaments */}
      <GununganOrnament className="absolute -left-12 -bottom-12 w-48 h-72 text-accent/15 dark:text-accent/10 pointer-events-none transform rotate-12 hidden sm:block" />
      <GununganOrnament className="absolute -right-12 -top-12 w-48 h-72 text-accent/15 dark:text-accent/10 pointer-events-none transform -rotate-12 hidden sm:block" />

      {/* Premium Glassmorphic Card */}
      <div className="relative max-w-md w-full bg-card/60 backdrop-blur-md border border-white/40 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl text-center z-10 hover:border-accent/40 transition-colors duration-500">
        {/* Animated Central Glyph */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20" style={{ animation: "spin 20s linear infinite" }}>
            <NusantaraGlyph className="w-12 h-12 text-accent animate-pulse" />
          </div>
        </div>

        <h1 className="font-display text-6xl font-bold text-primary tracking-tighter leading-none mb-2">404</h1>
        <h2 className="font-display text-xl font-semibold text-foreground tracking-tight mb-3">Halaman Tidak Ditemukan</h2>
        <h3 className="font-sans text-xs text-accent uppercase tracking-widest font-bold mb-4">Page Not Found</h3>
        
        <SulurDivider className="text-accent/30 max-w-[150px] mx-auto mb-6" />

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Waduh! Halaman yang Anda cari tidak ditemukan atau telah dipindahkan ke alamat lain.
          <span className="block mt-2 text-xs opacity-75 italic">The page you're looking for doesn't exist or has been moved.</span>
        </p>

        <div className="flex justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-accent/10 hover:scale-[1.02]"
          >
            Kembali ke Beranda <span className="text-xs">· Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden select-none">
      {/* Dynamic Background Watermarks */}
      <div className="absolute inset-0 pointer-events-none">
        <NusantaraPattern variant="truntum" className="text-accent/5 dark:text-accent/3 w-full h-full" opacity={0.06} />
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Decorative Gunungan Corner Ornaments */}
      <GununganOrnament className="absolute -left-12 -bottom-12 w-48 h-72 text-accent/15 dark:text-accent/10 pointer-events-none transform rotate-12 hidden sm:block" />
      <GununganOrnament className="absolute -right-12 -top-12 w-48 h-72 text-accent/15 dark:text-accent/10 pointer-events-none transform -rotate-12 hidden sm:block" />

      {/* Premium Glassmorphic Card */}
      <div className="relative max-w-md w-full bg-card/60 backdrop-blur-md border border-white/40 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl text-center z-10 hover:border-accent/40 transition-colors duration-500">
        {/* Animated Central Glyph */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20" style={{ animation: "spin 20s linear infinite" }}>
            <NusantaraGlyph className="w-12 h-12 text-accent animate-pulse" />
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-3xl text-primary font-semibold tracking-tight leading-tight mb-2">Halaman Gagal Dimuat</h1>
        <h2 className="font-sans text-xs text-accent uppercase tracking-widest font-bold mb-4">This Page Didn't Load</h2>
        
        <SulurDivider className="text-accent/30 max-w-[150px] mx-auto mb-6" />

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Terjadi sedikit gangguan teknis saat menghubungkan data. Silakan coba memuat kembali halaman ini.
          <span className="block mt-2 text-xs opacity-75 italic">Something went wrong on our end. You can try refreshing or head back home.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-accent/10 hover:scale-[1.02]"
          >
            Coba Lagi <span className="text-xs opacity-80">· Refresh</span>
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl bg-card border border-border text-primary font-semibold hover:border-accent/50 hover:bg-accent/5 transition-all hover:scale-[1.02]"
          >
            Beranda <span className="text-xs opacity-80">· Go Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Pro CV Creator generates professional, elegant CVs with project showcases and admin control." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Pro CV Creator generates professional, elegant CVs with project showcases and admin control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Pro CV Creator generates professional, elegant CVs with project showcases and admin control." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22b68767-1084-47eb-aa86-c4781ff92df2/id-preview-0b105e21--0f875a2d-5836-48b1-a50f-e1adb50c2b21.lovable.app-1778920174563.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22b68767-1084-47eb-aa86-c4781ff92df2/id-preview-0b105e21--0f875a2d-5836-48b1-a50f-e1adb50c2b21.lovable.app-1778920174563.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showPreloader, setShowPreloader] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const handlePreloaderFinished = () => {
    setContentVisible(true);
    setTimeout(() => setShowPreloader(false), 100);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {showPreloader && (
          <NusantaraPreloader onFinished={handlePreloaderFinished} />
        )}
        <div
          style={{
            opacity: contentVisible ? 1 : 0,
            transition: "opacity 0.5s ease 0.1s",
          }}
        >
          <Outlet />
          <Toaster />
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
