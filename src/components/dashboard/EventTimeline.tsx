import clsx from "clsx";
import type { TimelineEvent } from "../../types/patientDetail";

export interface EventTimelineProps {
  events: TimelineEvent[];
}

/**
 * "Timelines" per DESIGN.md's Components spec: a vertical 2px line in
 * outline-variant, with the most recent event anchored by a neutral-gray
 * node. Documented in the design system but never used on the
 * reference's single Overview screen - built here for the patient
 * detail drawer's recent-activity list.
 */
export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <ol className="flex flex-col">
      {events.map((event, index) => (
        <li key={event.id} className="flex gap-stack-sm">
          <div className="flex flex-col items-center">
            <span
              className={clsx(
                "w-2 h-2 rounded-full shrink-0 mt-1.5",
                event.isLatest
                  ? "bg-on-surface"
                  : "bg-surface-container-highest border border-outline-variant",
              )}
              aria-hidden="true"
            />
            {index < events.length - 1 && (
              <span className="w-0.5 flex-1 bg-outline-variant" aria-hidden="true" />
            )}
          </div>
          <div className={clsx("pb-stack-md", index === events.length - 1 && "pb-0")}>
            <p
              className={clsx(
                "font-body-sm text-body-sm",
                event.isLatest ? "text-on-surface font-medium" : "text-on-surface-variant",
              )}
            >
              {event.label}
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant normal-case tracking-normal mt-0.5">
              {event.time}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
