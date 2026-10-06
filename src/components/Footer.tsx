import type { Group } from "@/lib/waitlist";

const MIN_SHOWN = 50;

export default function Footer({ counts }: { counts: Record<Group, number> }) {
  const parts = (
    [
      ["farmer", "farmers"],
      ["seller", "sellers"],
      ["buyer", "buyers"],
    ] as const
  )
    .filter(([g]) => counts[g] >= MIN_SHOWN)
    .map(([g, label]) => `${counts[g].toLocaleString("en-NG")} ${label}`);

  return (
    <footer className="bg-soil px-6 py-14 text-husk">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-3xl font-extrabold text-sprout">Greenmart</p>
          <p className="mt-2 text-husk/75">Launching soon across Nigeria.</p>
          {parts.length > 0 && <p className="mt-4 font-medium">{parts.join(", ")} already joined.</p>}
        </div>
        <a
          className="inline-block rounded-full bg-sprout px-5 py-3 font-semibold text-soil hover:bg-[#8fc552]"
          href={`https://wa.me/?text=${encodeURIComponent("GreenMart is coming: buy fresh food straight from farmers. Join the waitlist: https://greenmart.ng")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on WhatsApp
        </a>
      </div>
    </footer>
  );
}
