import type { EventDetailsData } from "../types/event-details";

/**
 * Minimal mock catalog for EventDetailsPage skeleton.
 * No API — keyed by slug to match Home EventCard hrefs where possible.
 */
export const MOCK_EVENT_DETAILS: Record<string, EventDetailsData> = {
  "meia-maratona-brasilia": {
    id: "evt_01_meia",
    slug: "meia-maratona-brasilia",
    name: "Meia Maratona de Brasília",
    dateLabel: "16 de agosto de 2026",
    timeLabel: "06:30",
    distanceLabel: "21K",
    locationLabel: "Brasília — Eixo Monumental",
    imageAlt: "Corredores na Meia Maratona de Brasília",
    imageSrc: "/events/meia-maratona-brasilia.svg",
    registrationStatus: "open",
    pricing: {
      currentPriceLabel: "R$ 149",
      originalPriceLabel: "R$ 179",
      discountLabel: "Lote atual",
    },
    kit: {
      available: true,
      description:
        "Camiseta oficial, número de peito, chip de cronometragem e sacola do evento.",
      imageAlt: "Kit da Meia Maratona de Brasília",
    },
    route: {
      available: true,
      summary:
        "Percurso plano pelo Eixo Monumental, com pontos de hidratação a cada 3 km.",
      distanceLabel: "21 km",
      imageAlt: "Mapa esquemático do percurso",
    },
    schedule: {
      items: [
        {
          id: "kit-pickup",
          label: "Retirada de kit",
          timeLabel: "14 e 15 de agosto, 10h–20h",
        },
        {
          id: "concentration",
          label: "Concentração",
          timeLabel: "16 de agosto, 05:30",
        },
        {
          id: "start",
          label: "Largada",
          timeLabel: "16 de agosto, 06:30",
        },
      ],
    },
    regulation: {
      summary:
        "Participação sujeita ao regulamento oficial da prova, incluindo idade mínima e regras de segurança.",
      href: "#regulamento",
      linkLabel: "Ver regulamento completo",
    },
  },
  "corrida-noturna-parque": {
    id: "evt_02_noturna",
    slug: "corrida-noturna-parque",
    name: "Corrida Noturna do Parque",
    dateLabel: "26 de julho de 2026",
    timeLabel: "19:00",
    distanceLabel: "10K",
    locationLabel: "Brasília — Parque da Cidade",
    imageAlt: "Corrida noturna no Parque da Cidade",
    imageSrc: "/events/corrida-noturna-parque.svg",
    registrationStatus: "closed",
    pricing: {
      currentPriceLabel: "R$ 89",
    },
    kit: {
      available: true,
      description: "Camiseta dry-fit e número de peito com chip.",
      imageAlt: "Kit da Corrida Noturna",
    },
    route: {
      available: true,
      summary: "Voltas iluminadas nas pistas do Parque da Cidade.",
      distanceLabel: "10 km",
      imageAlt: "Percurso noturno no parque",
    },
    schedule: {
      items: [
        {
          id: "kit-pickup",
          label: "Retirada de kit",
          timeLabel: "25 de julho, 14h–20h",
        },
        {
          id: "start",
          label: "Largada",
          timeLabel: "26 de julho, 19:00",
        },
      ],
    },
    regulation: {
      summary: "Uso de lanterna frontal recomendado; siga as orientações da organização.",
      href: "#regulamento",
      linkLabel: "Ver regulamento completo",
    },
  },
  "5k-iniciantes-df": {
    id: "evt_03_5k_ini",
    slug: "5k-iniciantes-df",
    name: "5K Iniciantes DF",
    dateLabel: "2 de agosto de 2026",
    timeLabel: "07:00",
    distanceLabel: "5K",
    locationLabel: "Brasília — Ponte JK",
    imageAlt: "5K Iniciantes DF",
    imageSrc: "/events/5k-iniciantes-df.svg",
    registrationStatus: "upcoming",
    pricing: {
      currentPriceLabel: "Gratuito",
    },
    kit: {
      available: false,
      description: "Informações do kit serão divulgadas quando as inscrições abrirem.",
    },
    route: {
      available: true,
      summary: "Percurso curto e plano, ideal para primeira prova.",
      distanceLabel: "5 km",
      imageAlt: "Percurso 5K",
    },
    schedule: {
      items: [
        {
          id: "start",
          label: "Largada prevista",
          timeLabel: "2 de agosto, 07:00",
        },
      ],
    },
    regulation: {
      summary: "Regulamento preliminar — versão final na abertura das inscrições.",
      href: "#regulamento",
      linkLabel: "Ver regulamento",
    },
  },
};
