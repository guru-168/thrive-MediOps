import { MaterialSymbol } from "../icons/MaterialSymbol";
import { Card } from "./Card";
import { Button } from "./Button";

/**
 * Shared loading/error presentational states for anything backed by the
 * prediction API (see services/api.ts). Centralized so "the backend is
 * unreachable" always looks and reads the same way across pages, and so
 * no page is tempted to quietly fall back to fake data when a call
 * fails - failures are always shown, never hidden.
 */

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card tone="critical" className="p-stack-md flex items-start gap-stack-sm">
      <MaterialSymbol name="error" className="text-error shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-stack-sm">
        <div>
          <p className="font-body-sm text-body-sm font-medium text-error">Couldn't load risk predictions</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{message}</p>
        </div>
        {onRetry && (
          <Button variant="secondary" className="w-auto" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </Card>
  );
}

export function LoadingBanner({ message = "Loading risk predictions…" }: { message?: string }) {
  return (
    <Card className="p-stack-md flex items-center gap-stack-sm">
      <MaterialSymbol name="progress_activity" className="animate-spin text-on-surface-variant" />
      <p className="font-body-sm text-body-sm text-on-surface-variant">{message}</p>
    </Card>
  );
}
