import Script from "next/script";
import { MarketingHome } from "@/features/marketing/components/MarketingHome";
import { buildPageMetadata, buildSoftwareApplicationJsonLd, buildWebsiteJsonLd } from "@/shared/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return buildPageMetadata({
    title: "Prompt evaluation, prompt testing, and LLM QA",
    description:
      "Promitly is an open-source prompt evaluation platform for prompt testing, prompt comparison, structured output validation, LLM review workflows, and regression tracking.",
    path: "",
    locale,
    keywords: [
      "open source prompt evaluation",
      "prompt testing dashboard",
      "LLM QA platform",
      "prompt regression tool",
    ],
  });
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const websiteJsonLd = buildWebsiteJsonLd();
  const softwareJsonLd = buildSoftwareApplicationJsonLd();

  return (
    <>
      <Script
        id="promitly-website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Script
        id="promitly-software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <MarketingHome locale={locale} />
    </>
  );
}
