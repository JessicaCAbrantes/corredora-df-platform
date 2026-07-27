import type { Metadata } from "next";
import { MyKitsPage } from "@/features/events/components/MyKitsPage";

export const metadata: Metadata = {
  title: "Retirada de Kits",
  description: "Kits disponíveis para retirada das suas inscrições na Corredora DF.",
};

export default function KitsRoute() {
  return <MyKitsPage />;
}
