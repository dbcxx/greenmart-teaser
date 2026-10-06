import FieldIntro from "@/components/FieldIntro";
import HowItWorks from "@/components/HowItWorks";
import PickPath from "@/components/PickPath";
import Footer from "@/components/Footer";
import { store } from "@/lib/store";

export const revalidate = 60;

export default async function Home() {
  const counts = await store.counts();
  return (
    <main>
      <FieldIntro />
      <HowItWorks />
      <PickPath />
      <Footer counts={counts} />
    </main>
  );
}
