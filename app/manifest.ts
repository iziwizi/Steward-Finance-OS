import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StewardOS — Personal Finance",
    short_name: "StewardOS",
    description: "Your personal finance operating system.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F8FAF9",
    theme_color: "#1D6458",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
