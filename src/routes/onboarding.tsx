import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Upload, Hospital, Home, Plane, HeartPulse, FileText, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Începe — After" }, { name: "description", content: "Un chestionar scurt și blând pentru a-ți construi planul." }] }),
  component: Onboarding,
});

const placeOptions = [
  { id: "hospital", label: "La spital", icon: Hospital },
  { id: "home", label: "Acasă", icon: Home },
  { id: "abroad", label: "În străinătate", icon: Plane },
  { id: "care", label: "Într-un centru de îngrijire", icon: HeartPulse },
];

const steps = ["Locul", "Documente", "Detalii", "Context"] as const;

function Onboarding() {
  const [step, setStep] = useState(0);
  const [place, setPlace] = useState<string>("");

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-5 py-12 md:py-20">
        {/* progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Pasul {step + 1} din {steps.length}</span>
            <span>{steps[step]}</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {step === 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Condoleanțele noastre pentru pierderea ta.</p>
                <h1 className="mt-2 font-display text-3xl md:text-4xl">Unde a avut loc decesul?</h1>
                <p className="mt-3 text-muted-foreground">Ne ajută să pregătim documentele potrivite. Poți schimba mai târziu.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {placeOptions.map((o) => {
                    const selected = place === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => setPlace(o.id)}
                        className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-card hover:border-foreground/20"
                        }`}
                      >
                        <span className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          <o.icon className="h-5 w-5" />
                        </span>
                        <span className="font-medium">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="font-display text-3xl md:text-4xl">Încarcă ce ai la îndemână</h1>
                <p className="mt-3 text-muted-foreground">Adaugă documentele primite. Le citim noi, ca să nu mai retastezi nimic.</p>
                <div className="mt-8 space-y-3">
                  {["Certificat de deces", "Carte de identitate", "Alte documente justificative"].map((d) => (
                    <label key={d} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-card p-5 transition-colors hover:border-foreground/30">
                      <div className="flex items-center gap-4">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-medium">{d}</p>
                          <p className="text-xs text-muted-foreground">PDF, JPG sau HEIC · până la 20MB</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-xs">
                        <Upload className="h-3.5 w-3.5" /> Adaugă fișier
                      </span>
                      <input type="file" className="sr-only" />
                    </label>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground">Poți sări peste și adăuga documentele mai târziu din Centrul de documente.</p>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Am extras aceste date — te rugăm să le confirmi
                </div>
                <h1 className="mt-3 font-display text-3xl md:text-4xl">Câteva detalii despre persoana iubită</h1>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { l: "Nume complet", v: "Maria Popescu" },
                    { l: "CNP", v: "2•••••••••••" },
                    { l: "Data decesului", v: "12 mai 2026" },
                    { l: "Locul decesului", v: "București" },
                    { l: "Stare civilă", v: "Căsătorită" },
                  ].map((f) => (
                    <div key={f.l}>
                      <Label className="text-xs text-muted-foreground">{f.l}</Label>
                      <Input defaultValue={f.v} className="mt-2 h-12 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="font-display text-3xl md:text-4xl">Câteva întrebări în plus</h1>
                <p className="mt-3 text-muted-foreground">Acestea îți modelează cronologia personală. Nu există răspunsuri greșite.</p>
                <div className="mt-8 space-y-3">
                  {[
                    "Era pensionar/ă?",
                    "Deținea o proprietate?",
                    "Deținea un autovehicul?",
                    "Era asociat/administrator de firmă?",
                    "Există soț/soție supraviețuitor sau copii?",
                  ].map((q) => (
                    <div key={q} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
                      <p className="text-sm md:text-base">{q}</p>
                      <div className="flex gap-2">
                        {["Da", "Nu", "Nu știu"].map((c) => (
                          <button key={c} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-surface-soft">
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="rounded-full">
            <ArrowLeft className="mr-1 h-4 w-4" /> Înapoi
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={next} className="h-11 rounded-full px-6">
              Continuă <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="h-11 rounded-full px-6">
              <a href="/dashboard">Vezi planul meu <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
