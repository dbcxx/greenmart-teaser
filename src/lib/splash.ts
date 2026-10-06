/**
 * Handshake between the splash screen and the intro story.
 * The intro announces it's ready; the splash leaves and announces it's done;
 * the story starts playing only after that.
 */

export const INTRO_READY = "gm:intro-ready";
export const SPLASH_DONE = "gm:splash-done";

export function markIntroReady() {
  document.documentElement.dataset.intro = "ready";
  window.dispatchEvent(new Event(INTRO_READY));
}

/** Runs `cb` once the splash has gone (immediately if it already has). Returns an unsubscribe. */
export function onSplashDone(cb: () => void) {
  if (document.documentElement.dataset.splash === "done") {
    cb();
    return () => {};
  }
  window.addEventListener(SPLASH_DONE, cb, { once: true });
  return () => window.removeEventListener(SPLASH_DONE, cb);
}
