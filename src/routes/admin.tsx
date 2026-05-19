import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/abidlogin" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display text-4xl mb-3">Akses Ditolak</h1>
          <p className="text-muted-foreground mb-6">Akun Anda bukan admin.</p>
          <Button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/abidlogin" }))}>Keluar</Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/profile", label: "Profil" },
    { to: "/admin/experiences", label: "Pengalaman" },
    { to: "/admin/education", label: "Pendidikan" },
    { to: "/admin/projects", label: "Proyek" },
    { to: "/admin/skills", label: "Skill" },
    { to: "/admin/certificates", label: "Sertifikat" },
    { to: "/admin/testimonials", label: "Testimoni" },
    { to: "/admin/posts", label: "Blog" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-xl"><span className="text-primary">◆</span> Admin CV</Link>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))}>
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-[200px_1fr] gap-8">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-4 py-2 text-sm border-l-2 transition-colors ${
                  active ? "border-primary text-primary bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}