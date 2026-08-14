import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://shohojrin.com";

  const routes = [
    "",
    "/auth",
    "/onboarding",
    "/dashboard",
    "/loans",
    "/loans/details",
    "/apply",
    "/applications",
    "/my-loans",
    "/repayment",
    "/learn",
    "/lender",
    "/admin",
    "/system-states",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
