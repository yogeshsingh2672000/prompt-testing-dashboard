import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/shared/constants/site";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE_NAME,
        short_name: SITE_NAME,
        description: SITE_DESCRIPTION,
        start_url: "/en",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/og/promitly-icon.svg",
                sizes: "512x512",
                type: "image/svg+xml",
                purpose: "any",
            },
        ],
    };
}
