import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, HeartHandshake, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "After — Când durerea vine prima, nu hârtiile" },
      { name: "description", content: "After ghidează familiile din România, pas cu pas, prin procesul legal și administrativ de după o pierdere." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grain opacity-60" />
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Discret, sigur și creat pentru România
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-6xl">
              Când cineva moare, familia ar trebui să jelească —
              <span className="text-muted-foreground"> nu să se ocupe de birocrație.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground text-pretty md:text-lg">
              After ghidează familiile, pas cu pas, prin procesul legal și administrativ
              care urmează unei pierderi — cu cuvinte blânde și reamintiri delicate.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/intake">
                <Button size="lg" className="h-12 rounded-full px-6 text-base">
                  Începe ghidarea <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="ghost" className="h-12 rounded-full px-6 text-base">
                  Află mai multe
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Nu e nevoie de cont pentru a începe · Durează 4 minute</p>
          </motion.div>

          {/* Hero card preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-16 max-w-3xl"
          >
            <div className="rounded-4xl border border-border bg-card p-2 shadow-lift">
              <div className="rounded-[calc(var(--radius)+16px)] bg-surface p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Următorul pas</p>
                    <p className="mt-1 font-display text-2xl">Înregistrează decesul la primărie</p>
                  </div>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success-foreground">Ziua 1–3</span>
                </div>
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "34%" }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[
                    { t: "Certificat de deces", s: "Încărcat" },
                    { t: "Anunță angajatorul", s: "În așteptare" },
                    { t: "Începe succesiunea", s: "De urmărit" },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-sm font-medium">{c.t}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-border/60 bg-surface/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-8 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Conform GDPR</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Criptat end-to-end</span>
          <span className="inline-flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-primary" /> Creat cu consilieri de doliu</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Compatibil ROeID</span>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-4xl">Un drum mai blând prin hârtii</h2>
          <p className="mt-3 text-muted-foreground">
            Fiecare ecran răspunde la o singură întrebare: <em>ce am de făcut acum?</em>
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Spune-ne ce s-a întâmplat", body: "Un chestionar scurt și blând creează un plan potrivit familiei tale." },
            { icon: FileText, title: "Încarci documentele o singură dată", body: "Citim ce e nevoie și completăm formularele pentru instituții." },
            { icon: CheckCircle2, title: "Urmezi o cronologie calmă", body: "Sarcinile apar doar când e momentul — niciodată prea multe deodată." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card p-7 shadow-soft"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <blockquote className="rounded-4xl border border-border bg-surface px-8 py-12 text-center md:px-16 md:py-16">
          <p className="font-display text-2xl leading-snug md:text-3xl text-balance">
            „After a fost ca o mână caldă pe umăr. Mi-a spus doar ce aveam nevoie,
            și doar când eram pregătită.”
          </p>
          <footer className="mt-6 text-sm text-muted-foreground">— Ioana, Cluj-Napoca</footer>
        </blockquote>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-28">
        <div className="overflow-hidden rounded-4xl bg-foreground px-8 py-14 text-background md:px-16 md:py-20">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-balance">
                Începe când ești pregătit. Oprește-te oricând ai nevoie.
              </h2>
              <p className="mt-3 max-w-xl text-background/70">
                Progresul tău este salvat în siguranță. Poți invita oricând un membru al familiei sau un avocat.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/intake">
                <Button size="lg" variant="secondary" className="h-12 rounded-full px-6 text-base">
                  Începe ghidarea
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
