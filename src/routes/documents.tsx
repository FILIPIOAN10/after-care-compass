import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, ShieldCheck, Upload } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — After" }] }),
  component: Documents,
});

const docs = [
  { name: "Death certificate", category: "Identity", meta: "Issued · 14 May 2026", size: "1.2 MB" },
  { name: "ID card (deceased)", category: "Identity", meta: "Extracted: CNP, address", size: "0.4 MB" },
  { name: "Marriage certificate", category: "Family", meta: "Cluj-Napoca, 1987", size: "0.6 MB" },
  { name: "Property deed — Bucharest", category: "Assets", meta: "Apt., sector 2", size: "2.1 MB" },
  { name: "Vehicle title", category: "Assets", meta: "B-123-ABC", size: "0.3 MB" },
  { name: "Funeral allowance form", category: "Generated", meta: "Pre-filled by After", size: "0.2 MB" },
];

const cats = ["All", "Identity", "Family", "Assets", "Generated"];

function Documents() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">Document center</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Everything you've uploaded and everything we've prepared for you. Encrypted at rest.
            </p>
          </div>
          <Button className="h-11 rounded-full px-5">
            <Upload className="mr-1.5 h-4 w-4" /> Upload document
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {cats.map((c, i) => (
            <button
              key={c}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                i === 0 ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-surface-soft"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {docs.map((d) => (
            <article key={d.name} className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium">{d.name}</h3>
                  <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{d.category}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{d.meta} · {d.size}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-success-foreground">
                  <ShieldCheck className="h-3 w-3" /> Encrypted
                </p>
              </div>
              <button className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground" aria-label="Download">
                <Download className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
