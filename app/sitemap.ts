import type { MetadataRoute } from "next";
import { getSiteUrl, SITE_LOCALES } from "@/shared/constants/site";

const platformRoutes = [
    "",
    "/workspace",
    "/results",
    "/analytics",
    "/history",
    "/compare",
    "/datasets",
    "/schedules",
    "/reviews",
    "/settings",
];

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl();
    const now = new Date();

    return SITE_LOCALES.flatMap((locale) =>
        platformRoutes.map((route) => ({
            url: `${siteUrl}/${locale}${route}`,
            lastModified: now,
            changeFrequency: route === "" ? "weekly" : "daily",
            priority: route === "" ? 1 : route === "/workspace" ? 0.9 : 0.7,
        }))
    );
}
