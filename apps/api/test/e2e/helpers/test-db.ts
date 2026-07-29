import {
  KitPickupRequestStatus,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

export async function ensureEventRegistration(
  userId: string,
  eventId: string,
): Promise<{ id: string }> {
  return prisma.eventRegistration.upsert({
    where: {
      eventId_userId: { eventId, userId },
    },
    create: { eventId, userId },
    update: {},
    select: { id: true },
  });
}

export async function cancelActiveKitPickupRequests(
  userId: string,
  kitPickupServiceId: string,
): Promise<void> {
  await prisma.kitPickupRequest.updateMany({
    where: {
      userId,
      kitPickupServiceId,
      status: { not: KitPickupRequestStatus.CANCELLED },
    },
    data: { status: KitPickupRequestStatus.CANCELLED },
  });
}

export async function countPaymentsForRequest(
  kitPickupRequestId: string,
): Promise<number> {
  return prisma.kitPickupPayment.count({
    where: { kitPickupRequestId },
  });
}

export async function disconnectTestDb(): Promise<void> {
  await prisma.$disconnect();
}
