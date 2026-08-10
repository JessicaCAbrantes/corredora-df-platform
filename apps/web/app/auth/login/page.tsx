import type { Metadata } from "next";
import { LoginPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Entrar · Corredora DF",
  description: "Sua corrida começa aqui — acesse sua conta na Corredora DF.",
};

type AuthLoginRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

export default async function AuthLoginRoute({
  searchParams,
}: AuthLoginRouteProps) {
  const params = await searchParams;
  const returnUrl = firstParam(params.returnUrl);

  return <LoginPage returnUrl={returnUrl} />;
}
