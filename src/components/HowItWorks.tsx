const STEPS = [
  { title: "Farmers list what they harvest", body: "Growers post fresh produce with fair prices they set themselves." },
  { title: "GreenMart handles the rest", body: "Orders, payment and delivery run through one app. No middlemen." },
  { title: "Food lands on your table", body: "Households, restaurants and caterers get it fresh, straight from the farm." },
];

export default function HowItWorks() {
  return (
    <section className="bg-forest px-6 py-24 text-husk md:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display max-w-xl text-4xl font-bold leading-tight md:text-5xl">From farm to table in three steps.</h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t-2 border-sprout pt-5">
              <span className="font-display text-5xl font-extrabold text-sprout">{i + 1}</span>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 max-w-[32ch] text-husk/80">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
