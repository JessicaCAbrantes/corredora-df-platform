import type { Metadata } from "next";
import { MyRegistrationsPage } from "@/features/events/components/MyRegistrationsPage";

export const metadata: Metadata = {
  title: "Minhas inscrições",
  description: "Histórico das suas inscrições na Corredora DF.",
};

export default function MinhasInscricoesRoute() {
  return <MyRegistrationsPage />;
}
