import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RSL AI Fusion Tracker",
    short_name: "RSL Fusion",
    description:
      "AI-powered Raid: Shadow Legends fusion calendar tracker for events, tournaments, fragments, and leaderboard rewards.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#020617",
    theme_color: "#020617",
    categories: ["games", "productivity", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ],
    shortcuts: [
      {
        name: "Open Tracker",
        short_name: "Tracker",
        description: "Open your saved fusion tracker.",
        url: "/tracker",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
      },
      {
        name: "Admin",
        short_name: "Admin",
        description: "Open the protected admin editor.",
        url: "/admin",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
      }
    ]
  };
}
