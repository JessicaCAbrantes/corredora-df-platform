import { PrismaClient, EventCategory, EventLifecycleStatus, EventRegistrationMode, EventRegistrationStatus } from "@prisma/client";
import { hashPassword } from "../src/auth/password";

const prisma = new PrismaClient();

/** Dev-only Auth MVP credentials — never stored in plaintext in the DB. */
const SEED_USER_EMAIL = "runner@corredora.df";
const SEED_USER_PASSWORD = "corredora123";
const SEED_PARTICIPANT_2_EMAIL = "participant2@corredora.df";
const SEED_PARTICIPANT_2_PASSWORD = "corredora123";


/**
 * Deterministic seed for GET /api/v1/events smoke tests.
 * Price invariant: both amount+currency set, or both null.
 * cancelled/completed → registrationStatus = closed.
 */
const events = [
  {
    id: "evt_01_meia",
    name: "Meia Maratona de Brasília",
    slug: "meia-maratona-brasilia",
    date: new Date("2026-08-16T10:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.half_marathon,
    distance: "21K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    coverImage: "https://example.com/events/meia-maratona-brasilia.jpg",
    priceAmount: 149,
    priceCurrency: "BRL",
    registrationMode: EventRegistrationMode.internal,
    createdAt: new Date("2026-01-10T10:00:00.000Z"),
  },
  {
    id: "evt_02_noturna",
    name: "Corrida Noturna do Parque",
    slug: "corrida-noturna-parque",
    date: new Date("2026-07-26T22:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.k10,
    distance: "10K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.closed,
    coverImage: "https://example.com/events/corrida-noturna-parque.jpg",
    priceAmount: 89,
    priceCurrency: "BRL",
    registrationMode: EventRegistrationMode.internal,
    createdAt: new Date("2026-01-05T10:00:00.000Z"),
  },
  {
    id: "evt_03_5k_ini",
    name: "5K Iniciantes DF",
    slug: "5k-iniciantes-df",
    date: new Date("2026-08-02T12:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.k5,
    distance: "5K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.upcoming,
    coverImage: "https://example.com/events/5k-iniciantes-df.jpg",
    priceAmount: null,
    priceCurrency: null,
    registrationMode: EventRegistrationMode.external,
    createdAt: new Date("2026-02-01T10:00:00.000Z"),
  },
  {
    id: "evt_04_maratona",
    name: "Maratona Plano Piloto",
    slug: "maratona-plano-piloto",
    date: new Date("2026-09-20T09:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.marathon,
    distance: "42K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    coverImage: "https://example.com/events/maratona-plano-piloto.jpg",
    priceAmount: 219,
    priceCurrency: "BRL",
    registrationMode: EventRegistrationMode.internal,
    createdAt: new Date("2026-01-20T10:00:00.000Z"),
  },
  {
    id: "evt_05_trail",
    name: "Trail Chapada Imperial",
    slug: "trail-chapada-imperial",
    date: new Date("2026-10-12T11:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.trail,
    distance: "21K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    coverImage: "https://example.com/events/trail-chapada-imperial.jpg",
    priceAmount: 169,
    priceCurrency: "BRL",
    registrationMode: EventRegistrationMode.internal,
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
  },
  {
    id: "evt_06_taguatinga",
    name: "10K Taguatinga",
    slug: "10k-taguatinga",
    date: new Date("2026-06-08T13:00:00.000Z"),
    city: "Taguatinga",
    category: EventCategory.k10,
    distance: "10K",
    status: EventLifecycleStatus.completed,
    registrationStatus: EventRegistrationStatus.closed,
    coverImage: "https://example.com/events/10k-taguatinga.jpg",
    priceAmount: 79,
    priceCurrency: "BRL",
    registrationMode: EventRegistrationMode.internal,
    createdAt: new Date("2025-12-01T10:00:00.000Z"),
  },
  {
    id: "evt_07_cancelada",
    name: "Corrida do Lago",
    slug: "corrida-cancelada-lago",
    date: new Date("2026-05-30T12:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.k5,
    distance: "5K",
    status: EventLifecycleStatus.cancelled,
    registrationStatus: EventRegistrationStatus.closed,
    coverImage: "https://example.com/events/corrida-do-lago.jpg",
    priceAmount: 59,
    priceCurrency: "BRL",
    registrationMode: EventRegistrationMode.internal,
    createdAt: new Date("2025-11-10T10:00:00.000Z"),
  },
  {
    id: "evt_08_asa_norte",
    name: "5K Asa Norte",
    slug: "5k-asa-norte",
    date: new Date("2026-11-15T12:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.k5,
    distance: "5K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    coverImage: "https://example.com/events/5k-asa-norte.jpg",
    priceAmount: null,
    priceCurrency: null,
    registrationMode: EventRegistrationMode.internal,
    createdAt: new Date("2026-03-15T10:00:00.000Z"),
  },
] as const;

async function seedAuthUser(): Promise<void> {
  const email = SEED_USER_EMAIL.trim().toLowerCase();
  const passwordHash = hashPassword(SEED_USER_PASSWORD);
  const participant2Email = SEED_PARTICIPANT_2_EMAIL.trim().toLowerCase();
  const participant2PasswordHash = hashPassword(SEED_PARTICIPANT_2_PASSWORD);

  // Fixed id so local KIT_PICKUP_OPERATOR_USER_IDS can reference a stable value.
  await prisma.user.upsert({
    where: { email },
    create: {
      id: "usr_seed_runner",
      email,
      passwordHash,
    },
    update: {
      passwordHash,
    },
  });

  // Secondary deterministic participant used by ownership/isolation E2E tests.
  await prisma.user.upsert({
    create: {
      id: "usr_seed_participant_2",
      email: participant2Email,
      passwordHash: participant2PasswordHash,
    },
    update: {
      passwordHash: participant2PasswordHash,
    },
  });
}

/** Deterministic kits for events that support retirada MVP demos. */
const kits = [
  { id: "kit_01_meia", eventId: "evt_01_meia" },
  { id: "kit_04_maratona", eventId: "evt_04_maratona" },
  { id: "kit_05_trail", eventId: "evt_05_trail" },
  { id: "kit_08_asa_norte", eventId: "evt_08_asa_norte" },
] as const;

async function seedKits(): Promise<void> {
  for (const kit of kits) {
    await prisma.kit.upsert({
      where: { id: kit.id },
      create: {
        id: kit.id,
        eventId: kit.eventId,
      },
      update: {
        eventId: kit.eventId,
      },
    });
  }
}

/** Deterministic partners for Home Partners MVP. */
const partners = [
  {
    id: "ptr_01_nike",
    name: "Nike Running",
    slug: "nike-running",
    category: "Equipamento",
    logo: null,
    website: "https://www.nike.com",
    active: true,
  },
  {
    id: "ptr_02_asics",
    name: "ASICS",
    slug: "asics",
    category: "Equipamento",
    logo: null,
    website: "https://www.asics.com",
    active: true,
  },
  {
    id: "ptr_03_garmin",
    name: "Garmin",
    slug: "garmin",
    category: "Tecnologia",
    logo: null,
    website: "https://www.garmin.com",
    active: true,
  },
  {
    id: "ptr_04_oakberry",
    name: "Oakberry",
    slug: "oakberry",
    category: "Nutrição",
    logo: null,
    website: "https://www.oakberry.com",
    active: true,
  },
] as const;

async function seedPartners(): Promise<void> {
  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      create: { ...partner },
      update: {
        name: partner.name,
        slug: partner.slug,
        category: partner.category,
        logo: partner.logo,
        website: partner.website,
        active: partner.active,
      },
    });
  }
}

/** Deterministic coupons for Home Coupons MVP (no public code). */
const coupons = [
  {
    id: "cpn_01_welcome",
    title: "Cupom bem-vindo",
    discountLabel: "10% OFF",
    expiresAt: new Date("2026-08-31T23:59:59.000Z"),
    active: true,
    partnerId: null as string | null,
  },
  {
    id: "cpn_02_running",
    title: "Desconto em inscrição selecionada",
    discountLabel: "15% OFF",
    expiresAt: new Date("2026-12-31T23:59:59.000Z"),
    active: true,
    partnerId: "ptr_01_nike",
  },
  {
    id: "cpn_03_garmin",
    title: "Benefício Garmin",
    discountLabel: "R$ 50",
    expiresAt: new Date("2026-10-15T23:59:59.000Z"),
    active: true,
    partnerId: "ptr_03_garmin",
  },
  {
    id: "cpn_04_oakberry",
    title: "Oakberry Runner",
    discountLabel: "20% OFF",
    expiresAt: new Date("2026-09-30T23:59:59.000Z"),
    active: true,
    partnerId: "ptr_04_oakberry",
  },
  {
    id: "cpn_05_inactive",
    title: "Campanha encerrada",
    discountLabel: "5% OFF",
    expiresAt: new Date("2026-01-01T23:59:59.000Z"),
    active: false,
    partnerId: "ptr_02_asics",
  },
] as const;

async function seedCoupons(): Promise<void> {
  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { id: coupon.id },
      create: { ...coupon },
      update: {
        title: coupon.title,
        discountLabel: coupon.discountLabel,
        expiresAt: coupon.expiresAt,
        active: coupon.active,
        partnerId: coupon.partnerId,
      },
    });
  }
}

/** Deterministic blog posts for Home Blog MVP (no full article body). */
const blogPosts = [
  {
    id: "blg_01_5k_tips",
    title: "5 dicas para sua primeira corrida de 5K",
    slug: "5-dicas-primeira-corrida-5k",
    excerpt: "Preparação simples para estreantes no calendário do DF.",
    category: "Treino" as string | null,
    readingTimeMinutes: 5 as number | null,
    publishedAt: new Date("2026-06-10T09:00:00.000Z"),
    published: true,
  },
  {
    id: "blg_02_first_race",
    title: "Como se preparar para sua primeira prova",
    slug: "como-se-preparar-primeira-prova",
    excerpt: "Checklist prático do dia da prova para corredores do DF.",
    category: "Eventos" as string | null,
    readingTimeMinutes: 7 as number | null,
    publishedAt: new Date("2026-06-18T09:00:00.000Z"),
    published: true,
  },
  {
    id: "blg_03_training_df",
    title: "Treinos para correr melhor no DF",
    slug: "treinos-para-correr-melhor-no-df",
    excerpt: "Como adaptar o ritmo ao clima e ao relevo de Brasília.",
    category: "Treino" as string | null,
    readingTimeMinutes: 4 as number | null,
    publishedAt: new Date("2026-07-01T09:00:00.000Z"),
    published: true,
  },
  {
    id: "blg_04_draft",
    title: "Post em rascunho",
    slug: "post-em-rascunho",
    excerpt: "Artigo ainda não publicado — não deve aparecer na Home.",
    category: "Nutrição" as string | null,
    readingTimeMinutes: 3 as number | null,
    publishedAt: null,
    published: false,
  },
] as const;

async function seedBlogPosts(): Promise<void> {
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { id: post.id },
      create: { ...post },
      update: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category,
        readingTimeMinutes: post.readingTimeMinutes,
        publishedAt: post.publishedAt,
        published: post.published,
      },
    });
  }
}

/** Deterministic kit pickup offers for Home teaser (Phase 1 — no requests/payments). */
const kitPickupServices = [
  {
    id: "kps_01_own_event",
    eventId: "evt_01_meia",
    title: "Retirada de kit",
    serviceAvailable: true,
    feeAmount: null as number | null,
    feeCurrency: "BRL",
    pickupLocation: "Asa Norte" as string | null,
    pickupStartAt: new Date("2026-08-10T12:00:00.000Z"),
    pickupEndAt: new Date("2026-08-12T21:00:00.000Z"),
  },
  {
    id: "kps_02_third_party",
    eventId: "evt_03_5k_ini",
    title: "Retirada de kit (serviço Corredora DF)",
    serviceAvailable: true,
    feeAmount: 10 as number | null,
    feeCurrency: "BRL",
    pickupLocation: "Sede Corredora DF" as string | null,
    pickupStartAt: new Date("2026-07-28T12:00:00.000Z"),
    pickupEndAt: new Date("2026-07-30T21:00:00.000Z"),
  },
  {
    id: "kps_03_unavailable",
    eventId: "evt_04_maratona",
    title: "Retirada de kit",
    serviceAvailable: false,
    feeAmount: 15 as number | null,
    feeCurrency: "BRL",
    pickupLocation: "Plano Piloto" as string | null,
    pickupStartAt: new Date("2026-09-15T12:00:00.000Z"),
    pickupEndAt: new Date("2026-09-17T21:00:00.000Z"),
  },
] as const;

async function seedKitPickupServices(): Promise<void> {
  for (const service of kitPickupServices) {
    await prisma.kitPickupService.upsert({
      where: { id: service.id },
      create: { ...service },
      update: {
        eventId: service.eventId,
        title: service.title,
        serviceAvailable: service.serviceAvailable,
        feeAmount: service.feeAmount,
        feeCurrency: service.feeCurrency,
        pickupLocation: service.pickupLocation,
        pickupStartAt: service.pickupStartAt,
        pickupEndAt: service.pickupEndAt,
      },
    });
  }
}

async function main() {
  await seedAuthUser();

  for (const event of events) {
    const { priceAmount, priceCurrency, ...rest } = event;
    if (
      (priceAmount === null) !== (priceCurrency === null) ||
      (priceAmount === null && priceCurrency !== null) ||
      (priceAmount !== null && priceCurrency === null)
    ) {
      throw new Error(`Price invariant violated for ${event.id}`);
    }
    if (
      (rest.status === EventLifecycleStatus.cancelled ||
        rest.status === EventLifecycleStatus.completed) &&
      rest.registrationStatus !== EventRegistrationStatus.closed
    ) {
      throw new Error(`Lifecycle invariant violated for ${event.id}`);
    }

    await prisma.event.upsert({
      where: { id: event.id },
      create: {
        ...rest,
        priceAmount,
        priceCurrency,
      },
      update: {
        ...rest,
        priceAmount,
        priceCurrency,
      },
    });
  }

  await seedKits();
  await seedPartners();
  await seedCoupons();
  await seedBlogPosts();
  await seedKitPickupServices();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
