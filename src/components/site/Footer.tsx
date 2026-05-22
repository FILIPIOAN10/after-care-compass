import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground text-pretty">
            A calm companion for Romanian families navigating the days after a loss.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Guided workflows</li>
            <li>Document center</li>
            <li>AI translator</li>
            <li>Family collaboration</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium">Care</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Support line</li>
            <li>Privacy & security</li>
            <li>Accessibility</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} After. Built with care, in Romania.
      </div>
    </footer>
  );
}
