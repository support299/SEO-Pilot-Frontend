import type { NavIconName } from "./navConfig";

export function NavIcon({ name }: { name: NavIconName }) {
  const path = paths[name];
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const paths: Record<NavIconName, string> = {
  overview: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
  performance: "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3",
  local: "M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  opportunities: "M9 18h6M10 21h4M12 3a6 6 0 0 1 3.2 10.9c-.8.6-1.2 1.2-1.2 2.1h-4c0-.9-.4-1.5-1.2-2.1A6 6 0 0 1 12 3z",
  pages: "M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5zM14 3.5V8h4.5",
  manager: "M12 4.5a3 3 0 0 1 2.6 4.5H16a3 3 0 0 1 0 6h-.2A3 3 0 0 1 12 19.5 3 3 0 0 1 8.2 15H8a3 3 0 0 1 0-6h1.4A3 3 0 0 1 12 4.5z",
  approvals: "M12 3 4.5 6.5v5.2c0 4.4 3.2 7.4 7.5 8.8 4.3-1.4 7.5-4.4 7.5-8.8V6.5L12 3zm-2.2 9.2 1.7 1.7 4-4",
  health: "M4.5 12h3l2-4 3 8 2-4h5",
  authority: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 3 3.8 6 3.8 9S14.5 18 12 21c-2.5-3-3.8-6-3.8-9S9.5 6 12 3z",
  connections: "M5 12h3M16 12h3M12 5v3M12 16v3M8.5 8.5l2 2M13.5 13.5l2 2M15.5 8.5l-2 2M10.5 13.5l-2 2",
  execution: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  history: "M12 8v5l3 2M4.5 12A7.5 7.5 0 1 0 7 6.2M4.5 4.5v4h4",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a7.7 7.7 0 0 0 .1-1.5 7.7 7.7 0 0 0-.1-1.5l2-1.5-2-3.5-2.4.5a7.4 7.4 0 0 0-2.6-1.5L14 2h-4l-.4 2.5A7.4 7.4 0 0 0 7 6l-2.4-.5-2 3.5 2 1.5a7.7 7.7 0 0 0-.1 1.5 7.7 7.7 0 0 0 .1 1.5l-2 1.5 2 3.5 2.4-.5a7.4 7.4 0 0 0 2.6 1.5L10 22h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4.5 2-3.5z",
};
