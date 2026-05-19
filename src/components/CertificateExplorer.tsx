import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, Search, LayoutGrid, List, FileText, Eye, ExternalLink, X, Award, Info
} from "lucide-react";
import { Translate } from "@/components/Translate";
import { useI18n } from "@/lib/i18n";

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  description: string;
  image_url?: string;
  credential_url?: string;
  issue_date?: string;
}

interface CertificateExplorerProps {
  certificates: Certificate[];
}

function formatMonthYear(d: string, lang: "id" | "en") {
  return new Date(d).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short", year: "numeric" });
}

export function CertificateExplorer({ certificates }: CertificateExplorerProps) {
  const { lang, t } = useI18n();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssuer, setSelectedIssuer] = useState("All");
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  // Extract unique issuers to build Google Drive style folders
  const issuers = useMemo(() => {
    const all = certificates.map((c) => c.issuer);
    // Sort and get unique issuers, "All" goes first
    return ["All", ...Array.from(new Set(all)).sort()];
  }, [certificates]);

  // Filter logic: search and selected folder (issuer)
  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesIssuer = selectedIssuer === "All" || c.issuer === selectedIssuer;
      
      return matchesSearch && matchesIssuer;
    });
  }, [certificates, searchTerm, selectedIssuer]);

  return (
    <div className="w-full space-y-6">
      {/* 1. Folders (GDrive style folders for certificate issuers) */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-mono">Folders</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {issuers.map((issuer) => {
            const count = issuer === "All" 
              ? certificates.length 
              : certificates.filter((c) => c.issuer === issuer).length;
            const isSelected = selectedIssuer === issuer;

            return (
              <button
                key={issuer}
                onClick={() => setSelectedIssuer(issuer)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300 ${
                  isSelected 
                    ? "bg-accent/15 border-accent text-primary shadow-sm" 
                    : "bg-card/40 border-border hover:border-accent/40 text-muted-foreground hover:bg-card/60"
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? "bg-accent/10" : "bg-muted/50"}`}>
                  <Folder className={`w-4 h-4 ${isSelected ? "text-accent fill-accent/20" : "text-muted-foreground"}`} />
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate leading-tight">{issuer}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{count} {count > 1 ? "files" : "file"}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Toolbar (Search, Filter, View Toggles) */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-2">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={lang === "id" ? "Cari sertifikat..." : "Search files..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-card/40 border border-border rounded-full focus:outline-none focus:border-accent transition-colors text-primary placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg border transition-colors ${
              viewMode === "grid" 
                ? "bg-accent/10 border-accent text-accent" 
                : "border-border text-muted-foreground hover:text-primary bg-card/30"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg border transition-colors ${
              viewMode === "list" 
                ? "bg-accent/10 border-accent text-accent" 
                : "border-border text-muted-foreground hover:text-primary bg-card/30"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Certificate Grid or List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 border border-dashed border-border rounded-xl bg-card/10 text-muted-foreground"
          >
            <Info className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">{lang === "id" ? "Sertifikat tidak ditemukan." : "No matching certificates found."}</p>
          </motion.div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {filtered.map((c) => (
              <div 
                key={c.id}
                onClick={() => setActiveCert(c)}
                className="group bg-card/50 backdrop-blur-sm border border-border rounded-xl p-3 hover:border-accent hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted/60 mb-3 relative flex items-center justify-center border border-border/30">
                  {c.image_url ? (
                    <img 
                      src={c.image_url} 
                      alt={c.name} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-accent/50" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium bg-black/50 px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 backdrop-blur-sm">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-display text-xs font-semibold truncate text-primary leading-snug">
                    <Translate text={c.name} />
                  </h4>
                  <p className="text-[10px] text-accent truncate mt-0.5">
                    <Translate text={c.issuer} />
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* LIST VIEW */
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-card/30 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card/50 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Issuer</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                  {filtered.map((c) => (
                    <tr 
                      key={c.id}
                      onClick={() => setActiveCert(c)}
                      className="hover:bg-card/45 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-medium text-primary flex items-center gap-3">
                        <FileText className="w-4 h-4 text-accent shrink-0" />
                        <span className="truncate max-w-[180px] sm:max-w-md">
                          <Translate text={c.name} />
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <Translate text={c.issuer} />
                      </td>
                      <td className="py-3 px-4 text-[11px] text-muted-foreground font-mono">
                        {c.issue_date ? formatMonthYear(c.issue_date, lang) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2.5">
                          <button 
                            onClick={() => setActiveCert(c)} 
                            className="p-1 text-muted-foreground hover:text-accent transition-colors"
                            title="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {c.credential_url && (
                            <a 
                              href={c.credential_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1 text-muted-foreground hover:text-accent transition-colors"
                              title="Credential Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Google Drive style fullscreen interactive preview modal */}
      <AnimatePresence>
        {activeCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCert(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 no-print"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#131316] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-auto max-h-[85vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveCert(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Side: Dynamic Image Viewer */}
              <div className="flex-1 bg-black/40 flex items-center justify-center p-6 relative min-h-[250px] md:min-h-[420px] overflow-hidden">
                {/* Cyber grid aesthetic background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {activeCert.image_url ? (
                  <img 
                    src={activeCert.image_url} 
                    alt={activeCert.name} 
                    className="max-w-full max-h-[40vh] md:max-h-[60vh] object-contain rounded shadow-2xl border border-white/5" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/30">
                    <Award className="w-16 h-16 stroke-[1] text-accent" />
                    <p className="text-xs font-mono">No Certificate Image Available</p>
                  </div>
                )}
              </div>

              {/* Right Side: Details Inspector (GDrive Panel Style) */}
              <div className="w-full md:w-[300px] bg-[#1a1a1f] border-t md:border-t-0 md:border-l border-white/10 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-accent font-bold px-2 py-0.5 rounded bg-accent/10">Certificate File</span>
                    <h3 className="font-display text-lg text-white font-semibold mt-2.5 leading-snug">
                      <Translate text={activeCert.name} />
                    </h3>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <p className="text-white/40 font-mono text-[10px]">Issuer</p>
                      <p className="text-white font-medium mt-0.5"><Translate text={activeCert.issuer} /></p>
                    </div>
                    
                    <div>
                      <p className="text-white/40 font-mono text-[10px]">Issued On</p>
                      <p className="text-white/80 font-mono mt-0.5">{activeCert.issue_date ? formatMonthYear(activeCert.issue_date, lang) : "—"}</p>
                    </div>

                    {activeCert.description && (
                      <div>
                        <p className="text-white/40 font-mono text-[10px] mb-1">Details</p>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-white/70 leading-relaxed max-h-[120px] overflow-y-auto">
                          <Translate text={activeCert.description} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-white/10 mt-5 flex flex-col gap-2.5">
                  {activeCert.credential_url && (
                    <a 
                      href={activeCert.credential_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full h-10 bg-accent hover:opacity-90 text-accent-foreground font-medium rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify Credential
                    </a>
                  )}
                  <button 
                    onClick={() => setActiveCert(null)}
                    className="w-full h-10 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center transition-all border border-white/10 text-xs"
                  >
                    {lang === "id" ? "Tutup Pratinjau" : "Close Preview"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
