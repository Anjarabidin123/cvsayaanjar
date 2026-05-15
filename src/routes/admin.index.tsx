import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, FolderKanban, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [exp, proj, skill] = await Promise.all([
        supabase.from("experiences").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("skills").select("id", { count: "exact", head: true }),
      ]);
      return { exp: exp.count ?? 0, proj: proj.count ?? 0, skill: skill.count ?? 0 };
    },
  });

  const cards = [
    { label: "Pengalaman", value: data?.exp ?? 0, icon: Briefcase },
    { label: "Proyek", value: data?.proj ?? 0, icon: FolderKanban },
    { label: "Skill", value: data?.skill ?? 0, icon: Sparkles },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Ringkasan konten CV Anda.</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-border/60 bg-card p-6">
            <c.icon className="w-6 h-6 text-primary mb-4" />
            <div className="font-display text-4xl">{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}