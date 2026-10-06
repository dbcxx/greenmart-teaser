"use client";

import { useEffect, useRef } from "react";
import { trackScene } from "@/lib/analytics";

/** Zero-height sentinel: reports a scene the first time it scrolls into view. */
export default function SceneMarker({ scene }: { scene: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        trackScene(scene);
        io.disconnect();
      }
    });
    io.observe(node);
    return () => io.disconnect();
  }, [scene]);
  return <div ref={el} aria-hidden className="h-0" />;
}
