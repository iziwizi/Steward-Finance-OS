import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StewardOS — Personal Finance Operating System",
    short_name: "StewardOS",
    description: "Faithful, wise, and prosperous personal finance operating system.",
    start_url: "/login",
    display: "standalone",
    background_color: "#F8FAF9",
    theme_color: "#1D6458",
    icons: [
      { src: "/brand/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
