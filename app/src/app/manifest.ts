import type { MetadataRoute } from "next";

/**
 * Web app manifest — makes the app installable as a PWA.
 *
 * display: "standalone" removes the browser chrome when installed.
 * Icons are generated dynamically by icon.tsx / apple-icon.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cycle Tracker",
    short_name: "Cycle",
    description: "Personal menstrual cycle tracking",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F4F1",
    theme_color: "#F5F4F1",
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
