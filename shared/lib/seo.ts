import type { Metadata } from "next";
import {
    getSiteUrl,
    SITE_DEFAULT_LOCALE,
    SITE_DESCRIPTION,
    SITE_KEYWORDS,
    SITE_LOCALES,
    SITE_NAME,
    SOCIAL_IMAGE_PATH,
} from "@/shared/constants/site";

function normalizePath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
}

export function buildLocalizedAlternates(path: string) {
    const normalizedPath = normalizePath(path);
    return Object.fromEntries(
        SITE_LOCALES.map((locale) => [locale, `/${locale}${normalizedPath}`])
    );
}

export function buildPageMetadata({
    title,
    description,
    path,
    locale = SITE_DEFAULT_LOCALE,
    keywords = [],
}: {
    title: string;
    description: string;
    path: string;
    locale?: string;
    keywords?: string[];
}): Metadata {
    const siteUrl = getSiteUrl();
    const normalizedPath = normalizePath(path);
    const canonicalPath = `/${locale}${normalizedPath}`;
    const fullUrl = `${siteUrl}${canonicalPath}`;
    const fullTitle = `${title} | ${SITE_NAME}`;

    return {
        title: fullTitle,
        description,
        keywords: [...SITE_KEYWORDS, ...keywords],
        alternates: {
            canonical: canonicalPath,
            languages: buildLocalizedAlternates(normalizedPath),
        },
        openGraph: {
            title: fullTitle,
            description,
            type: "website",
            url: fullUrl,
            siteName: SITE_NAME,
            locale,
            images: [
                {
                    url: SOCIAL_IMAGE_PATH,
                    width: 1200,
                    height: 630,
                    alt: `${SITE_NAME} social preview`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [SOCIAL_IMAGE_PATH],
        },
    };
}

export function buildSoftwareApplicationJsonLd() {
    const siteUrl = getSiteUrl();

    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description: SITE_DESCRIPTION,
        keywords: SITE_KEYWORDS.join(", "),
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
    };
}

export function buildWebsiteJsonLd() {
    const siteUrl = getSiteUrl();

    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        inLanguage: SITE_LOCALES,
    };
}
