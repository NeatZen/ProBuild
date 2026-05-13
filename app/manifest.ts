import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ProBuild — Construction estimate",
    short_name: "ProBuild",
    description: "Mobile-friendly line-item construction estimating",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f5",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
