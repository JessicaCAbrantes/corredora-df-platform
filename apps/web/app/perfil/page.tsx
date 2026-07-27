import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Identidade da sua conta na Corredora DF.",
};

export default function PerfilRoute() {
  return <ProfilePage />;
}
