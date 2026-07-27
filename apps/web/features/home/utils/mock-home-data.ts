/**
 * Mock data for Home sections still outside dynamic APIs
 * (Kits, Blog). Featured Events, Coupons and Partners use GET APIs.
 */

export const MOCK_KITS = [
  {
    id: "kit-1",
    title: "Kit Premium",
    eventName: "Meia Maratona de Brasília",
    statusLabel: "Retirada em breve",
    pickupLabel: "Local e horário serão confirmados",
    href: "/kits",
  },
  {
    id: "kit-2",
    title: "Kit Básico",
    eventName: "5K Iniciantes DF",
    statusLabel: "Informativo",
    pickupLabel: "Consulte após a inscrição",
    href: "/kits",
  },
] as const;

export const MOCK_BLOG_POSTS = [
  {
    id: "blg-1",
    title: "5 dicas para sua primeira corrida de 5K",
    excerpt: "Preparação simples para estreantes no calendário do DF.",
    category: "Treino",
    readingTime: "5 min de leitura",
    href: "/blog/5-dicas-primeira-corrida-5k",
  },
  {
    id: "blg-2",
    title: "Como escolher o tênis certo",
    excerpt: "Guia rápido com pontos de atenção antes de investir.",
    category: "Equipamento",
    readingTime: "7 min de leitura",
    href: "/blog/como-escolher-tenis",
  },
  {
    id: "blg-3",
    title: "Calendário de provas no DF",
    excerpt: "O que observar ao montar sua temporada de corridas.",
    category: "Eventos",
    readingTime: "4 min de leitura",
    href: "/blog/calendario-provas-df",
  },
] as const;
