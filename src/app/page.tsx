import FieldIntro from "@/components/FieldIntro";
import Splash from "@/components/Splash";
import HowItWorks from "@/components/HowItWorks";
import PickPath from "@/components/PickPath";
import Footer from "@/components/Footer";
import SceneMarker from "@/components/SceneMarker";
import { store } from "@/lib/store";
import type { Group } from "@/lib/waitlist";

export const revalidate = 60;

async function safeCounts(): Promise<Record<Group, number>> {
  try {
    return await store.counts();
  } catch (e) {
    // The page must render even if the database is down or unreachable at build.
    console.error("[counts]", e);
    return { farmer: 0, seller: 0, buyer: 0 };
  }
}

export default async function Home() {
  const counts = await safeCounts();
  return (
    <main>
      <Splash />
      <FieldIntro />
      <SceneMarker scene="how it works" />
      <HowItWorks />
      <SceneMarker scene="pick your path" />
      <PickPath turnstileSiteKey={process.env.TURNSTILE_SITE_KEY} />
      <SceneMarker scene="footer" />
      <Footer counts={counts} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenmart.ng"} />
    </main>
  );
}
