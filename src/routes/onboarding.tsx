import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Upload, Hospital, Home, Plane, HeartPulse, FileText, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Begin — After" }, { name: "description", content: "A short, kind questionnaire to shape your plan." }] }),
  component: Onboarding,
});

const placeOptions = [
  { id: "hospital", label: "In a hospital", icon: Hospital },
  { id: "home", label: "At home", icon: Home },
  { id: "abroad", label: "Abroad", icon: Plane },
  { id: "care", label: "In a care center", icon: HeartPulse },
];

const steps = ["Place", "Documents", "Details", "Circumstances"] as const;

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
            <span>Step {step + 1} of {steps.length}</span>
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
                <p className="text-sm text-muted-foreground">We're sorry for your loss.</p>
                <h1 className="mt-2 font-display text-3xl md:text-4xl">Where did the death occur?</h1>
                <p className="mt-3 text-muted-foreground">This helps us prepare the right paperwork. You can change it later.</p>
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
                <h1 className="font-display text-3xl md:text-4xl">Upload what you have</h1>
                <p className="mt-3 text-muted-foreground">Add any documents you've received. We'll read them so you don't have to retype.</p>
                <div className="mt-8 space-y-3">
                  {["Death certificate", "ID card of the deceased", "Other supporting documents"].map((d) => (
                    <label key={d} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-card p-5 transition-colors hover:border-foreground/30">
                      <div className="flex items-center gap-4">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-medium">{d}</p>
                          <p className="text-xs text-muted-foreground">PDF, JPG or HEIC · up to 20MB</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-xs">
                        <Upload className="h-3.5 w-3.5" /> Add file
                      </span>
                      <input type="file" className="sr-only" />
                    </label>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground">You can skip this and add documents later from the Document Center.</p>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> We extracted these details — please confirm
                </div>
                <h1 className="mt-3 font-display text-3xl md:text-4xl">A few details about your loved one</h1>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { l: "Full name", v: "Maria Popescu" },
                    { l: "CNP", v: "2•••••••••••" },
                    { l: "Date of death", v: "12 May 2026" },
                    { l: "Place of death", v: "Bucharest" },
                    { l: "Marital status", v: "Married" },
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
                <h1 className="font-display text-3xl md:text-4xl">A few more questions</h1>
                <p className="mt-3 text-muted-foreground">These shape your personal timeline. There are no wrong answers.</p>
                <div className="mt-8 space-y-3">
                  {[
                    "Were they retired?",
                    "Did they own property?",
                    "Did they own a vehicle?",
                    "Were they the owner of a company?",
                    "Is there a surviving spouse or children?",
                  ].map((q) => (
                    <div key={q} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
                      <p className="text-sm md:text-base">{q}</p>
                      <div className="flex gap-2">
                        {["Yes", "No", "Not sure"].map((c) => (
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
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={next} className="h-11 rounded-full px-6">
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="h-11 rounded-full px-6">
              <a href="/dashboard">See my plan <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
