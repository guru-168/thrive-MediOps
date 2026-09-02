import type { ReactNode } from "react";
import { Card } from "../ui/Card";

/**
 * Shared full-screen shell for /login and /signup: centered card on the
 * plain app background, same brand mark as the sidebar (SideNav.tsx) so
 * these screens read as the front door of the same product rather than a
 * different visual style bolted on.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-container-margin">
      <div className="w-full max-w-sm flex flex-col gap-stack-lg">
        <div className="flex flex-col items-center text-center gap-1">
          <h1 className="text-title-lg font-title-lg font-bold text-on-surface tracking-tight">
            MediOps Premium
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Clinical Command Center</p>
        </div>

        <Card as="section" className="p-stack-lg flex flex-col gap-stack-md">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}
