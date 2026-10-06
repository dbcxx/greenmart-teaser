/**
 * Thin wrapper over Plausible and GA4. Whichever script is loaded (see
 * components/Analytics.tsx) receives the event; with neither, this is a no-op.
 */

type Props = Record<string, string | number>;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void;
    gtag?: (cmd: "event", name: string, params?: Props) => void;
  }
}

export function track(event: string, props?: Props) {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props && { props });
  window.gtag?.("event", event.toLowerCase().replace(/\s+/g, "_"), props);
}

const seen = new Set<string>();

/** Fires a "Scene viewed" event once per scene per page load. */
export function trackScene(scene: string) {
  if (seen.has(scene)) return;
  seen.add(scene);
  track("Scene viewed", { scene });
}
