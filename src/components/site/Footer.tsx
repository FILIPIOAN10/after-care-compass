import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground text-pretty">
            Un însoțitor calm pentru familiile din România în zilele de după o pierdere.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium">Produs</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Pași ghidați</li>
            <li>Centrul de documente</li>
            <li>Traducător AI</li>
            <li>Colaborare în familie</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium">Sprijin</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Linie de asistență</li>
            <li>Confidențialitate & securitate</li>
            <li>Accesibilitate</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} After. Construit cu grijă, în România.
      </div>
    </footer>
  );
}
