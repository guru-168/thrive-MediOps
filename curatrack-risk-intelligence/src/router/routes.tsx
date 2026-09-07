export interface RouteMeta {
  /** Sidebar label and top-bar title source of truth for this screen. */
  path: string;
  navLabel: string;
  /** Top app bar title - differs from navLabel for Overview ("Clinical Dashboard"). */
  title: string;
  icon: string;
}

/** Sidebar nav items and top-bar titles, in the order shown in the Stitch reference. */
export const routeMeta: RouteMeta[] = [
  { path: "/", navLabel: "Overview", title: "Clinical Dashboard", icon: "dashboard" },
  { path: "/patients", navLabel: "Patients", title: "Patients", icon: "person" },
  {
    path: "/risk-assessment",
    navLabel: "Risk Assessment",
    title: "Risk Assessment",
    icon: "monitor_heart",
  },
  {
    path: "/follow-ups",
    navLabel: "Follow-ups",
    title: "Follow-ups",
    icon: "event_repeat",
  },
  { path: "/analytics", navLabel: "Analytics", title: "Analytics", icon: "analytics" },
  { path: "/settings", navLabel: "Settings", title: "Settings", icon: "settings" },
];
