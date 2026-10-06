import Script from "next/script";

/**
 * Plausible (NEXT_PUBLIC_PLAUSIBLE_DOMAIN) and/or GA4 (NEXT_PUBLIC_GA_ID).
 * Loaded after the page is interactive so they never compete with the intro.
 */
export default function Analytics() {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      {plausible && (
        <>
          <Script defer data-domain={plausible} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
          <Script id="plausible-queue" strategy="afterInteractive">
            {"window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}"}
          </Script>
        </>
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
    </>
  );
}
