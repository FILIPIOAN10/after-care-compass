import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Download, ShieldCheck, Upload, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { api, apiDownloadUrl, ApiError, getToken, type DocumentResponse } from "@/lib/api";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documente — After" }] }),
  component: Documents,
});

const categoryChoices = ["Identitate", "Familie", "Bunuri", "Generate", "Altele"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Documents() {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Toate");
  const [pickedCategory, setPickedCategory] = useState<string>("Identitate");
  const [pickedName, setPickedName] = useState<string>("");

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      navigate({ to: "/security", search: { redirect: "/documents", mode: "login" } });
    }
  }, [auth.loading, auth.isAuthenticated, navigate]);

  const docsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => api<DocumentResponse[]>("/api/documents"),
    enabled: auth.isAuthenticated,
  });

  const uploadMutation = useMutation({
    mutationFn: async (input: { file: File; name: string; category: string }) => {
      const fd = new FormData();
      fd.append("file", input.file);
      fd.append("name", input.name);
      fd.append("category", input.category);
      return api<DocumentResponse>("/api/documents", { method: "POST", body: fd });
    },
    onSuccess: (d) => {
      toast.success(`„${d.name}” a fost încărcat.`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Încărcarea a eșuat."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api<void>(`/api/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documentul a fost șters.");
    },
  });

  const docs = docsQuery.data ?? [];
  const cats = useMemo(() => {
    const set = new Set<string>(["Toate"]);
    docs.forEach((d) => set.add(d.category));
    return Array.from(set);
  }, [docs]);

  const filtered =
    activeCategory === "Toate" ? docs : docs.filter((d) => d.category === activeCategory);

  const onPick = () => fileRef.current?.click();

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const name = pickedName.trim() || file.name;
    uploadMutation.mutate({ file, name, category: pickedCategory });
    setPickedName("");
  };

  const handleDownload = async (d: DocumentResponse) => {
    try {
      const res = await fetch(apiDownloadUrl(`/api/documents/${d.id}/download`), {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = d.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Descărcarea a eșuat.");
    }
  };

  if (auth.loading || !auth.isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-5 py-16 text-sm text-muted-foreground">
          Se încarcă…
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">Centrul de documente</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Tot ce ai încărcat și tot ce am pregătit pentru tine. Stocat criptat.
            </p>
          </div>
          <Button
            onClick={onPick}
            disabled={uploadMutation.isPending}
            className="h-11 rounded-full px-5"
          >
            <Upload className="mr-1.5 h-4 w-4" />
            {uploadMutation.isPending ? "Se încarcă…" : "Încarcă document"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl border border-border bg-surface p-5 md:grid-cols-[1.6fr_1fr_auto]">
          <input
            value={pickedName}
            onChange={(e) => setPickedName(e.target.value)}
            placeholder="Nume document (opțional). Ex: Certificat de deces"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={pickedCategory}
            onChange={(e) => setPickedCategory(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          >
            {categoryChoices.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={onPick} className="rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" /> Alege fișier
          </Button>
        </div>

        {cats.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  c === activeCategory
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:bg-surface-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-xl">Niciun document încărcat încă</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Folosește butonul de mai sus ca să adaugi primul document.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {filtered.map((d) => (
              <article
                key={d.id}
                className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium">{d.name}</h3>
                    <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {d.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString("ro-RO")} · {formatSize(d.sizeBytes)}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-success-foreground">
                    <ShieldCheck className="h-3 w-3" /> Criptat
                  </p>
                </div>
                <button
                  className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground"
                  aria-label="Descarcă"
                  onClick={() => handleDownload(d)}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Șterge"
                  onClick={() => {
                    if (confirm(`Ștergi „${d.name}”?`)) deleteMutation.mutate(d.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
