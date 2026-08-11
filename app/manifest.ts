import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StewardOS — Personal Finance",
    short_name: "StewardOS",
    description: "Your personal finance operating system.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#1F6F52",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
