import type { Metadata } from "next";
import { HomePage } from "@/features/home";

export const metadata: Metadata = {
  title: {
    absolute: "Corredora DF | Corridas e eventos",
  },
  description:
    "Descubra corridas, kits, cupons, parceiros e comunidade no Distrito Federal.",
};

/**
 * Home route — thin App Router entry.
 * Featured Events fetch lives in features/home HomePage (getEventsList).
 */
export default function Home() {
  return <HomePage />;
}
