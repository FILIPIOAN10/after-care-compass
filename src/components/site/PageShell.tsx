import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ApiConnectivity } from "./ApiConnectivity";

export function PageShell({ children, hideFooter }: { children: ReactNode; hideFooter?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <ApiConnectivity />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
