import type { Metadata } from "next";
import { HomePage } from "@/features/home";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Corredora DF | Corridas e eventos",
  },
  description:
    "Descubra corridas, kits, cupons, parceiros e comunidade no Distrito Federal.",
};

/**
 * Home route — thin App Router entry.
 * Dynamic: Home sections fetch public APIs at request time (no-store).
 */
export default function Home() {
  return <HomePage />;
}
