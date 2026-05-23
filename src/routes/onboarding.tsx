import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Hospital,
  Home,
  Plane,
  HeartPulse,
  Building2,
  FileText,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Info,
  ShieldCheck,
  Flag,
  Globe2,
  Languages,
  Car,
  Landmark,
  Banknote,
  Briefcase,
  Plug,
  Scale,
  Heart,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Începe — After" },
      { name: "description", content: "Spune-ne unde a avut loc decesul și cetățenia persoanei — îți arătăm exact ce ai de făcut." },
    ],
  }),
  component: Onboarding,
});

type PlaceId = "hospital" | "home" | "care" | "public" | "abroad";
type NationalityId = "ro" | "eu" | "non_eu";

type Step = {
  title: string;
  what: string;
  where?: string;
  who?: string;
  time?: string;
  next?: string;
};

type Guide = {
  intro: string;
  steps: Step[];
};

const placeOptions: { id: PlaceId; label: string; sub: string; icon: typeof Home }[] = [
  { id: "hospital", label: "La spital", sub: "Personalul medical eliberează certificatul constatator", icon: Hospital },
  { id: "home", label: "Acasă", sub: "Trebuie chemat medicul de familie sau ambulanța", icon: Home },
  { id: "care", label: "Într-un centru de îngrijire", sub: "Centrul ajută cu actele medicale inițiale", icon: HeartPulse },
  { id: "public", label: "În spațiu public sau accident", sub: "Intervine Poliția și medicina legală", icon: Building2 },
  { id: "abroad", label: "În străinătate", sub: "Repatrierea cere pași suplimentari", icon: Plane },
];

const nationalityOptions: {
  id: NationalityId;
  label: string;
  sub: string;
  icon: typeof Flag;
}[] = [
  {
    id: "ro",
    label: "Cetățean român",
    sub: "Procedura standard la Starea Civilă din România.",
    icon: Flag,
  },
  {
    id: "eu",
    label: "Cetățean UE / SEE / Elveția",
    sub: "Acte recunoscute fără apostilă, dar trebuie notificată ambasada și repatrierea poate fi cerută.",
    icon: Globe2,
  },
  {
    id: "non_eu",
    label: "Cetățean non-UE",
    sub: "Necesită notificare consulară, traducere legalizată și, de obicei, repatriere către țara de origine.",
    icon: Languages,
  },
];

const guides: Record<PlaceId, Guide> = {
  hospital: {
    intro:
      "Spitalul se ocupă de constatarea medicală. Tu trebuie să iei două documente de la ei și să mergi cu ele la Starea Civilă.",
    steps: [
      {
        title: "Cere Certificatul medical constatator al decesului",
        what:
          "Este formularul tipizat completat de medicul curant. Fără el nu se poate elibera certificatul de deces.",
        where: "De la secția unde s-a aflat pacientul sau de la registratura spitalului.",
        who: "Medicul curant sau medicul de gardă.",
        time: "În aceeași zi sau a doua zi.",
        next: "Verifică să aibă semnătură, parafă și ștampila spitalului.",
      },
      {
        title: "Ridică actele personale ale persoanei decedate",
        what: "Cartea de identitate (originalul) și, dacă există, certificatul de naștere și de căsătorie.",
        where: "De la asistenta-șefă a secției.",
        time: "Imediat.",
        next: "Le vei preda la Starea Civilă împreună cu certificatul medical.",
      },
      {
        title: "Mergi la Starea Civilă din primăria locului decesului",
        what:
          "Aici se eliberează Certificatul de deces — documentul oficial cu care faci toate celelalte demersuri.",
        where: "Primăria sectorului / localității unde a survenit decesul (nu unde locuia persoana).",
        time: "În maximum 3 zile de la deces.",
        next: "Vei primi gratuit Certificatul de deces și Adeverința de înhumare/incinerare.",
      },
      {
        title: "Contactează o firmă de servicii funerare",
        what: "Ei se ocupă de transport, sicriu, organizarea înmormântării și pot prelua și demersurile la Starea Civilă.",
        time: "Cât mai repede — multe lucruri depind de programarea lor.",
        next: "Cere o ofertă scrisă cu toate costurile înainte să semnezi.",
      },
    ],
  },
  home: {
    intro:
      "Acasă nu există un medic care să constate decesul automat. Primul pas este să fie chemată o persoană autorizată să-l constate.",
    steps: [
      {
        title: "Sună 112 sau medicul de familie",
        what:
          "Dacă decesul a fost așteptat (boală cunoscută), poate veni medicul de familie. În rest, sună la 112 și vor trimite un echipaj.",
        who: "Medicul de familie, ambulanța (112) sau Poliția.",
        time: "Imediat — nu mutați persoana până nu vine cineva autorizat.",
        next: "Vor stabili dacă e necesară autopsia sau dacă se poate elibera direct certificatul constatator.",
      },
      {
        title: "Obține Certificatul medical constatator al decesului",
        what:
          "Dacă medicul de familie cunoștea boala, el îl poate elibera direct. Altfel, corpul este preluat de Medicina Legală (INML / SML) și certificatul vine de acolo după examinare.",
        where: "Cabinetul medicului de familie sau Serviciul Județean de Medicină Legală.",
        time: "1–3 zile, în funcție de caz.",
        next: "Fără acest document nu poți obține Certificatul de deces.",
      },
      {
        title: "Pregătește actele persoanei decedate",
        what: "Carte de identitate (original), certificat de naștere, certificat de căsătorie dacă era cazul.",
        where: "Din locuință.",
        next: "Le vei depune la Starea Civilă.",
      },
      {
        title: "Înregistrează decesul la Starea Civilă",
        what:
          "La primăria localității/sectorului unde s-a produs decesul. Aici primești Certificatul de deces și Adeverința de înhumare.",
        where: "Primăria locului decesului.",
        time: "În maximum 3 zile lucrătoare de la deces.",
        next: "Documentele se eliberează gratuit, pe loc.",
      },
      {
        title: "Contactează o firmă de servicii funerare",
        what: "Pentru transport, pregătire și înmormântare. Pot prelua și formalitățile la Starea Civilă în numele tău.",
        time: "Cât mai curând.",
      },
    ],
  },
  care: {
    intro:
      "Centrul de îngrijire are personal medical care va face primii pași. Întreabă-i ce au făcut deja — adesea ridici doar actele finale.",
    steps: [
      {
        title: "Vorbește cu administratorul centrului",
        what:
          "Ei îți spun ce medic a constatat decesul și unde se găsește Certificatul medical constatator.",
        time: "În aceeași zi.",
      },
      {
        title: "Ridică Certificatul medical constatator",
        what: "Eliberat fie de medicul centrului, fie de un medic chemat la fața locului.",
        where: "De la administrația centrului.",
        next: "Verifică să fie semnat, parafat și ștampilat.",
      },
      {
        title: "Mergi la Starea Civilă pentru Certificatul de deces",
        what: "La primăria localității unde se află centrul de îngrijire.",
        time: "În maximum 3 zile de la deces.",
        next: "Vei primi gratuit certificatul oficial și Adeverința de înhumare.",
      },
      {
        title: "Organizează transportul cu o firmă funerară",
        what: "Centrul nu se ocupă de transportul către capela sau locul înmormântării.",
      },
    ],
  },
  public: {
    intro:
      "În aceste cazuri intervin automat Poliția și medicina legală. Tu trebuie să aștepți să-ți comunice ei pașii — nu poți accelera procesul.",
    steps: [
      {
        title: "Așteaptă să fii contactat de Poliție",
        what:
          "Te vor suna pentru identificare și pentru a-ți cere acte. Corpul este preluat automat la Medicina Legală (INML / SML).",
        who: "Poliția secției pe raza căreia a avut loc evenimentul.",
        time: "În câteva ore până la 1 zi.",
      },
      {
        title: "Mergi pentru identificare și depunerea actelor",
        what:
          "Iei cu tine cartea ta de identitate și, dacă ai, actele persoanei decedate. Vei semna un proces-verbal de identificare.",
        where: "Sediul Poliției sau Serviciul de Medicină Legală.",
      },
      {
        title: "Așteaptă rezultatul autopsiei",
        what:
          "Pentru deces violent, accident sau cauză neclară, autopsia este obligatorie. Fără raportul ei nu se eliberează certificatul constatator.",
        time: "De obicei 3–10 zile, uneori mai mult.",
      },
      {
        title: "Ridică Certificatul medical constatator",
        what: "Eliberat de Medicina Legală după finalizarea autopsiei.",
        where: "Serviciul Județean de Medicină Legală (sau INML pentru București).",
        next: "Cu el mergi la Starea Civilă pentru Certificatul de deces.",
      },
      {
        title: "Înregistrează decesul la Starea Civilă",
        what: "La primăria locului unde a survenit decesul.",
        time: "În 3 zile de la eliberarea certificatului constatator.",
      },
    ],
  },
  abroad: {
    intro:
      "Procedura este mai lungă pentru că implică autoritățile țării respective și ambasada/consulatul României. Așteaptă-te la 1–3 săptămâni până la repatriere.",
    steps: [
      {
        title: "Contactează imediat Ambasada sau Consulatul României",
        what:
          "Ei te ghidează prin procedura locală, te ajută cu traducerea actelor și cu repatrierea.",
        who: "Misiunea diplomatică a României din țara respectivă.",
        time: "Sună în aceeași zi — programul lor de urgență e non-stop.",
      },
      {
        title: "Obține certificatul de deces local",
        what:
          "Eliberat de autoritatea civilă a țării unde s-a produs decesul. Va fi în limba locală.",
        where: "Autoritățile locale (echivalentul Stării Civile).",
      },
      {
        title: "Cere Apostila de la Haga sau supralegalizarea",
        what:
          "Pentru ca actul să fie recunoscut în România, are nevoie de apostilă (pentru țările semnatare ale Convenției de la Haga) sau de supralegalizare.",
        where: "Autoritatea desemnată din țara respectivă.",
      },
      {
        title: "Tradu actul în limba română",
        what: "Traducere legalizată la un notar din România sau la consulat.",
      },
      {
        title: "Organizează repatrierea sau înhumarea locală",
        what:
          "O firmă specializată internațională se ocupă de transport. Costul poate fi 2.000–8.000 EUR în funcție de țară.",
        time: "5–14 zile de obicei.",
      },
      {
        title: "Înregistrează decesul în România",
        what:
          "Cu actul tradus și apostilat, mergi la Starea Civilă din ultima localitate de domiciliu pentru transcriere.",
        where: "Primăria de domiciliu a persoanei decedate.",
      },
    ],
  },
};

// Pași suplimentari adăugați în funcție de cetățenie (când decesul a avut loc în România).
const nationalityExtras: Record<NationalityId, Step[]> = {
  ro: [],
  eu: [
    {
      title: "Anunță ambasada/consulatul țării de cetățenie",
      what:
        "Misiunea diplomatică din România trebuie informată oficial. Ei pot emite un pașaport mortuar și pot ajuta familia din străinătate.",
      who: "Ambasada sau consulatul țării de cetățenie acreditat în România.",
      time: "În primele 24–48 de ore.",
      next: "Cere-le în scris lista exactă a documentelor pentru repatriere sau înhumare locală.",
    },
    {
      title: "Cere certificatul de deces multilingv (Convenția de la Viena 1976)",
      what:
        "La Starea Civilă poți cere forma extras multilingv — este recunoscut direct în țările UE/SEE, fără traducere sau apostilă.",
      where: "Aceeași primărie unde se înregistrează decesul.",
      next: "Este gratuit la prima eliberare și economisește săptămâni de proceduri.",
    },
    {
      title: "Decide: înhumare în România sau repatriere",
      what:
        "Pentru repatriere în UE este nevoie de sicriu metalic sigilat, certificat de îmbălsămare și pașaport mortuar. O firmă funerară internațională se ocupă de logistică.",
      time: "3–7 zile pentru repatrierea în UE.",
    },
  ],
  non_eu: [
    {
      title: "Anunță urgent ambasada/consulatul țării de cetățenie",
      what:
        "Este obligatoriu. Multe state cer notificare consulară imediată și pot avea cerințe religioase sau legale specifice (ex. înhumare în max. 24h pentru anumite culte).",
      who: "Ambasada sau consulatul țării de cetățenie.",
      time: "În aceeași zi.",
      next: "Cere lista exactă a documentelor și dacă acceptă înhumare locală sau cer repatriere.",
    },
    {
      title: "Pregătește traducerea legalizată a certificatului de deces",
      what:
        "Certificatul românesc trebuie tradus de un traducător autorizat și legalizat la notar. Pentru țări non-UE, va fi nevoie și de apostilă (state Haga) sau supralegalizare la MAE + ambasadă.",
      where: "Notar public + Ministerul Afacerilor Externe (Direcția Apostilă) + consulatul țării destinatare.",
      time: "3–10 zile lucrătoare.",
    },
    {
      title: "Organizează repatrierea către țara de origine",
      what:
        "Repatrierea este aproape întotdeauna cerută. Necesită pașaport mortuar emis de consulat, sicriu metalic sigilat, certificat de îmbălsămare și acordul companiei aeriene.",
      time: "7–21 de zile, în funcție de țară și de documentația consulară.",
      next: "Cere o firmă funerară cu experiență în repatrieri internaționale — costurile sunt 3.000–10.000 EUR.",
    },
    {
      title: "Verifică obligațiile fiscale și de viză din România",
      what:
        "Dacă persoana avea permis de ședere, acesta trebuie predat la Inspectoratul General pentru Imigrări. Dacă avea bunuri sau cont bancar în România, succesiunea se deschide în România.",
      where: "IGI județean și un notar din ultima localitate de domiciliu.",
    },
  ],
};

// Pași după ce funeraliile au avut loc — comuni, indiferent de locul decesului.
// Ordonați aproximativ după urgență (primele zile → primele luni).
type PostStep = Step & { icon: typeof FileText };
const postFuneralSteps: PostStep[] = [
  {
    icon: Banknote,
    title: "Cere ajutorul de înmormântare",
    what:
      "Sumă forfetară plătită familiei pentru a acoperi parțial costurile funerare. În 2025 valoarea este în jur de 8.620 lei pentru pensionari.",
    where: "Casa Județeană de Pensii (dacă era pensionar) sau angajator (dacă era salariat).",
    time: "Cerere în maximum 3 ani de la deces, dar ideal în prima lună.",
    next: "Ai nevoie de: certificat de deces (copie), CI solicitant, factură funerară, dovadă rudenie.",
  },
  {
    icon: Briefcase,
    title: "Anunță angajatorul sau Casa de Pensii",
    what:
      "Dacă era salariat, angajatorul oprește plata salariului și eliberează adeverințe pentru succesiune. Dacă era pensionar, pensia se sistează de la luna următoare.",
    where: "Departamentul HR sau Casa Județeană de Pensii.",
    time: "În primele 5 zile lucrătoare.",
  },
  {
    icon: Heart,
    title: "Verifică dreptul la pensie de urmaș",
    what:
      "Soțul/soția, copiii minori sau elevii/studenții până la 26 de ani pot avea drept la pensie de urmaș. Se calculează ca procent din pensia decedatului.",
    where: "Casa Județeană de Pensii.",
    next: "Dosar: certificat deces, certificate naștere copii, adeverințe școlare, certificat căsătorie.",
  },
  {
    icon: FileText,
    title: "Anulează cartea de identitate și pașaportul",
    what:
      "Actele de identitate se predau Stării Civile odată cu certificatul medical, dar pașaportul rămâne la familie. Trebuie anulat separat ca să nu fie folosit fraudulos.",
    where: "Direcția de Evidență a Persoanelor (CI) și Serviciul Pașapoarte.",
  },
  {
    icon: Scale,
    title: "Deschide succesiunea la notar",
    what:
      "Stabilește oficial moștenitorii și permite transferul proprietăților (casă, teren, conturi, mașină). Cu cât e deschisă mai repede, cu atât eviți penalități fiscale.",
    where: "Notar public din ultima localitate de domiciliu a persoanei decedate.",
    time: "Ideal în primele 2 luni. Obligatoriu în maximum 2 ani pentru a evita taxa de 1% pe valoarea moștenirii.",
    next: "Acte necesare: certificat de deces, certificate naștere/căsătorie moștenitori, acte proprietăți, extrase cont.",
  },
  {
    icon: Car,
    title: "Transferă sau radiază autovehiculul",
    what:
      "Mașina nu poate circula legal pe numele unei persoane decedate. După certificatul de moștenitor, se face transferul sau radierea la DRPCIV.",
    where: "Serviciul Înmatriculări (DRPCIV) din județul de domiciliu.",
    time: "În 30 de zile de la finalizarea succesiunii.",
    next: "Anunță și asigurătorul RCA — polița poate fi rambursată proporțional.",
  },
  {
    icon: Landmark,
    title: "Anunță băncile și blochează conturile",
    what:
      "Conturile se blochează automat la cerere, până la finalizarea succesiunii. Cardurile trebuie distruse. Verifică dacă existau credite cu asigurare de viață — pot fi acoperite.",
    where: "Sucursala fiecărei bănci unde avea conturi.",
    next: "Cere extras de cont la data decesului — îți va trebui la notar.",
  },
  {
    icon: Plug,
    title: "Actualizează contractele de utilități și abonamente",
    what:
      "Energie, gaz, apă, internet, telefon, Netflix — pot fi transferate pe numele moștenitorului sau anulate. Multe se pot face online cu certificatul de deces.",
    where: "Furnizorii respectivi.",
    time: "În primele 1–3 luni.",
  },
];


function Onboarding() {
  const [place, setPlace] = useState<PlaceId | null>(null);
  const [nationality, setNationality] = useState<NationalityId | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggleDone = (key: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const selected = place ? placeOptions.find((o) => o.id === place)! : null;
  const selectedNat = nationality ? nationalityOptions.find((o) => o.id === nationality)! : null;
  const baseGuide = place ? guides[place] : null;

  // În străinătate cetățenia română este implicită pentru fluxul de repatriere — nu adăugăm pași.
  const extras =
    place && nationality && place !== "abroad" ? nationalityExtras[nationality] : [];
  const beforeSteps = baseGuide ? [...baseGuide.steps, ...extras] : [];
  const baseLen = baseGuide?.steps.length ?? 0;

  const beforeDoneCount = useMemo(
    () => beforeSteps.filter((s) => done.has(`b:${s.title}`)).length,
    [beforeSteps, done],
  );
  const beforeProgress = beforeSteps.length ? Math.round((beforeDoneCount / beforeSteps.length) * 100) : 0;

  const showGuide = place && (place === "abroad" || nationality);

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {!place ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-sm text-muted-foreground">Condoleanțele noastre pentru pierderea ta.</p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">Unde a avut loc decesul?</h1>
              <p className="mt-3 text-muted-foreground text-pretty">
                Răspunsul ne ajută să-ți arătăm exact ce ai de făcut acum, de unde să iei fiecare document și ce urmează după.
                Nu e nevoie să-ți faci cont.
              </p>

              <div className="mt-8 grid gap-3">
                {placeOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setPlace(o.id)}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-foreground/30 hover:shadow-soft"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <o.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{o.label}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{o.sub}</span>
                    </span>
                    <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-surface/60 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <p>Nu colectăm date personale în această etapă. Răspunsul rămâne doar pe acest dispozitiv.</p>
              </div>
            </motion.div>
          ) : !showGuide ? (
            <motion.div
              key="nationality"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <button
                onClick={() => setPlace(null)}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Înapoi
              </button>

              <div className="mt-5 flex items-center gap-3">
                {selected && (
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <selected.icon className="h-5 w-5" />
                  </span>
                )}
                <p className="text-sm uppercase tracking-wider text-muted-foreground">{selected?.label}</p>
              </div>

              <h1 className="mt-3 font-display text-3xl md:text-4xl text-balance">
                Ce cetățenie avea persoana decedată?
              </h1>
              <p className="mt-3 text-muted-foreground text-pretty">
                Cetățenia schimbă procedura: notificarea consulară, traducerea actelor și posibila repatriere.
                Pentru cetățenii străini există pași în plus pe care îi adăugăm automat în ghid.
              </p>

              <div className="mt-8 grid gap-3">
                {nationalityOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setNationality(o.id)}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-foreground/30 hover:shadow-soft"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <o.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{o.label}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{o.sub}</span>
                    </span>
                    <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${place}-${nationality ?? "abroad"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={() => {
                  if (place !== "abroad" && nationality) setNationality(null);
                  else setPlace(null);
                }}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Schimbă răspunsul
              </button>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {selected && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wider text-primary">
                    <selected.icon className="h-3.5 w-3.5" />
                    {selected.label}
                  </span>
                )}
                {selectedNat && place !== "abroad" && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wider text-foreground/70">
                    <selectedNat.icon className="h-3.5 w-3.5" />
                    {selectedNat.label}
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-display text-3xl md:text-4xl text-balance">
                Iată planul tău, în ordinea în care contează.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground text-pretty">
                Bifează fiecare pas când îl închei. Plănuiește restul cu calm — nu există termene care să nu poată fi
                explicate.
              </p>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-foreground/80 text-pretty">{baseGuide!.intro}</p>
              </div>

              {/* FAZA 1: până la funeralii */}
              <section className="mt-10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary">Faza 1 · Urgent</p>
                    <h2 className="mt-1 font-display text-2xl">Până la funeralii</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Acești pași sunt obligatorii ca să poată avea loc înmormântarea.
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {beforeDoneCount} / {beforeSteps.length} pași încheiați
                  </div>
                </div>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${beforeProgress}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>

                <ol className="mt-6 space-y-4">
                  {beforeSteps.map((s, i) => {
                    const isExtra = i >= baseLen;
                    const key = `b:${s.title}`;
                    const isDone = done.has(key);
                    return (
                      <motion.li
                        key={s.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.04 }}
                        className={`rounded-2xl border border-border bg-card p-5 shadow-soft transition-opacity ${isDone ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleDone(key)}
                            aria-pressed={isDone}
                            aria-label={isDone ? "Marchează ca neîncheiat" : "Marchează ca încheiat"}
                            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
                              isDone
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">{i + 1}</span>}
                          </button>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className={`font-display text-xl leading-snug ${isDone ? "line-through decoration-1" : ""}`}>
                                {s.title}
                              </h3>
                              {isExtra && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                                  Pas pentru {selectedNat?.label.toLowerCase()}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-foreground/80 text-pretty">{s.what}</p>

                            <dl className="mt-4 grid gap-2 text-sm">
                              {s.where && <Row icon={MapPin} label="De unde">{s.where}</Row>}
                              {s.who && <Row icon={Phone} label="Cine">{s.who}</Row>}
                              {s.time && <Row icon={Clock} label="Când">{s.time}</Row>}
                              {s.next && <Row icon={CheckCircle2} label="Apoi">{s.next}</Row>}
                            </dl>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </section>

              {/* FAZA 2: după funeralii */}
              <section className="mt-14">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Faza 2 · În următoarele luni</p>
                <h2 className="mt-1 font-display text-2xl">După funeralii</h2>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  Mașină, conturi bancare, succesiune, pensii, utilități. Nu sunt urgente în primele zile — fă-le pe rând.
                </p>

                <ol className="mt-6 space-y-4">
                  {postFuneralSteps.map((s, i) => {
                    const key = `a:${s.title}`;
                    const isDone = done.has(key);
                    const Icon = s.icon;
                    return (
                      <motion.li
                        key={s.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.03 }}
                        className={`rounded-2xl border border-border bg-card p-5 shadow-soft transition-opacity ${isDone ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleDone(key)}
                            aria-pressed={isDone}
                            aria-label={isDone ? "Marchează ca neîncheiat" : "Marchează ca încheiat"}
                            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
                              isDone
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </button>
                          <div className="flex-1">
                            <h3 className={`font-display text-lg leading-snug ${isDone ? "line-through decoration-1" : ""}`}>
                              {s.title}
                            </h3>
                            <p className="mt-2 text-sm text-foreground/80 text-pretty">{s.what}</p>
                            <dl className="mt-4 grid gap-2 text-sm">
                              {s.where && <Row icon={MapPin} label="De unde">{s.where}</Row>}
                              {s.time && <Row icon={Clock} label="Când">{s.time}</Row>}
                              {s.next && <Row icon={CheckCircle2} label="Apoi">{s.next}</Row>}
                            </dl>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </section>


              <div className="mt-10 rounded-3xl border border-border bg-surface p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-xl">Vrei să urmărim împreună fiecare pas?</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
                      Îți pregătim un plan personalizat — cu memento-uri delicate, formulare gata completate și o cronologie
                      pentru perioada următoare (succesiune, pensie, taxe). Tot fără cont obligatoriu.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link to="/dashboard">
                        <Button className="h-11 rounded-full px-5">
                          Vezi planul complet <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/translator">
                        <Button variant="ghost" className="h-11 rounded-full px-5">
                          Nu înțeleg un termen
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-surface-soft px-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <span className="mr-1 text-xs uppercase tracking-wider text-muted-foreground">{label}:</span>
        <span className="text-foreground/85">{children}</span>
      </div>
    </div>
  );
}
