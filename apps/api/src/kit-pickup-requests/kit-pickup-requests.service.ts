import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  EventRegistrationMode,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateKitPickupRequestDto } from "./dto/create-kit-pickup-request.dto";
import {
  toCurrentTermResponse,
  toKitPickupRequestDto,
} from "./kit-pickup-requests.mapper";
import type {
  CurrentTermResponse,
  KitPickupRequestListResponse,
  KitPickupRequestResponse,
} from "./kit-pickup-requests.types";
import {
  KIT_PICKUP_TERM_VERSION,
  hashKitPickupTerm,
} from "./kit-pickup-term";

const REQUEST_INCLUDE = {
  kitPickupService: { include: { event: true } },
  participant: true,
  termAcceptance: true,
} as const;

@Injectable()
export class KitPickupRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  getCurrentTerm(): CurrentTermResponse {
    return toCurrentTermResponse();
  }

  async create(
    userId: string,
    dto: CreateKitPickupRequestDto,
  ): Promise<KitPickupRequestResponse> {
    const service = await this.prisma.kitPickupService.findUnique({
      where: { id: dto.kitPickupServiceId },
      include: { event: true },
    });

    if (!service) {
      throw this.error(
        HttpStatus.NOT_FOUND,
        "SERVICE_NOT_FOUND",
        "Serviço de retirada não encontrado.",
      );
    }

    if (!service.serviceAvailable) {
      throw this.error(
        HttpStatus.CONFLICT,
        "SERVICE_UNAVAILABLE",
        "Serviço de retirada indisponível.",
      );
    }

    const mode = service.event.registrationMode;
    let registrationId: string | null = null;

    if (mode === EventRegistrationMode.internal) {
      if (dto.participant) {
        throw this.error(
          HttpStatus.BAD_REQUEST,
          "PARTICIPANT_NOT_ALLOWED",
          "Evento próprio exige inscrição interna.",
        );
      }
      if (!dto.registrationId) {
        throw this.error(
          HttpStatus.BAD_REQUEST,
          "REGISTRATION_REQUIRED",
          "Informe a inscrição do evento.",
        );
      }

      const registration = await this.prisma.eventRegistration.findUnique({
        where: { id: dto.registrationId },
      });

      if (!registration) {
        throw this.error(
          HttpStatus.NOT_FOUND,
          "REGISTRATION_NOT_FOUND",
          "Inscrição não encontrada.",
        );
      }

      if (registration.userId !== userId) {
        throw this.error(
          HttpStatus.FORBIDDEN,
          "REGISTRATION_FORBIDDEN",
          "Inscrição não pertence ao usuário autenticado.",
        );
      }

      if (registration.eventId !== service.eventId) {
        throw this.error(
          HttpStatus.BAD_REQUEST,
          "REGISTRATION_EVENT_MISMATCH",
          "Inscrição não pertence ao evento deste serviço.",
        );
      }

      registrationId = registration.id;
    } else {
      if (dto.registrationId) {
        throw this.error(
          HttpStatus.BAD_REQUEST,
          "REGISTRATION_NOT_ALLOWED",
          "Evento externo não aceita inscrição interna.",
        );
      }
      if (!dto.participant) {
        throw this.error(
          HttpStatus.BAD_REQUEST,
          "PARTICIPANT_REQUIRED",
          "Informe os dados do participante.",
        );
      }
      if (!dto.participant.externalRegistrationCode?.trim()) {
        throw this.error(
          HttpStatus.BAD_REQUEST,
          "EXTERNAL_CODE_REQUIRED",
          "Informe o código de inscrição externa.",
        );
      }
    }

    const active = await this.prisma.kitPickupRequest.findFirst({
      where: {
        userId,
        kitPickupServiceId: service.id,
        status: { not: KitPickupRequestStatus.CANCELLED },
      },
    });

    if (active) {
      throw this.error(
        HttpStatus.CONFLICT,
        "ACTIVE_REQUEST_EXISTS",
        "Já existe uma solicitação ativa para este serviço.",
      );
    }

    const feeAmountSnapshot = service.feeAmount;
    const feeCurrencySnapshot = feeAmountSnapshot
      ? service.feeCurrency
      : null;

    try {
      const created = await this.prisma.kitPickupRequest.create({
        data: {
          userId,
          kitPickupServiceId: service.id,
          registrationId,
          status: KitPickupRequestStatus.TERM_PENDING,
          paymentStatus: KitPickupPaymentStatus.UNPAID,
          feeAmountSnapshot,
          feeCurrencySnapshot,
          participant: dto.participant
            ? {
                create: {
                  fullName: dto.participant.fullName.trim(),
                  email: dto.participant.email.trim().toLowerCase(),
                  phone: dto.participant.phone.trim(),
                  externalRegistrationCode:
                    dto.participant.externalRegistrationCode.trim(),
                },
              }
            : undefined,
        },
        include: REQUEST_INCLUDE,
      });

      return { data: toKitPickupRequestDto(created) };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw this.error(
          HttpStatus.CONFLICT,
          "ACTIVE_REQUEST_EXISTS",
          "Já existe uma solicitação ativa para este serviço.",
        );
      }
      throw error;
    }
  }

  async listMine(userId: string): Promise<KitPickupRequestListResponse> {
    const rows = await this.prisma.kitPickupRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: REQUEST_INCLUDE,
    });
    return { data: rows.map((row) => toKitPickupRequestDto(row)) };
  }

  async getMine(
    userId: string,
    id: string,
  ): Promise<KitPickupRequestResponse> {
    const row = await this.prisma.kitPickupRequest.findFirst({
      where: { id, userId },
      include: REQUEST_INCLUDE,
    });
    if (!row) {
      throw this.notFound();
    }
    return { data: toKitPickupRequestDto(row) };
  }

  async acceptTerm(
    userId: string,
    id: string,
  ): Promise<KitPickupRequestResponse> {
    const row = await this.prisma.kitPickupRequest.findFirst({
      where: { id, userId },
      include: REQUEST_INCLUDE,
    });

    if (!row) {
      throw this.notFound();
    }

    if (row.status === KitPickupRequestStatus.CANCELLED) {
      throw this.error(
        HttpStatus.CONFLICT,
        "REQUEST_CANCELLED",
        "Solicitação cancelada.",
      );
    }

    if (row.termAcceptance) {
      // Idempotent: already accepted
      return { data: toKitPickupRequestDto(row) };
    }

    if (row.status !== KitPickupRequestStatus.TERM_PENDING) {
      throw this.error(
        HttpStatus.CONFLICT,
        "INVALID_STATUS",
        "Termo não pode ser aceito neste estado.",
      );
    }

    const hasFee = row.feeAmountSnapshot != null;
    // No fee → payment waived and immediately eligible for operations.
    const nextStatus = hasFee
      ? KitPickupRequestStatus.PAYMENT_PENDING
      : KitPickupRequestStatus.PICKUP_PENDING;
    const nextPayment = hasFee
      ? KitPickupPaymentStatus.PENDING
      : KitPickupPaymentStatus.WAIVED;

    await this.prisma.$transaction([
      this.prisma.pickupTermAcceptance.create({
        data: {
          kitPickupRequestId: row.id,
          version: KIT_PICKUP_TERM_VERSION,
          termContentHash: hashKitPickupTerm(),
          acceptedByUserId: userId,
        },
      }),
      this.prisma.kitPickupRequest.update({
        where: { id: row.id },
        data: {
          status: nextStatus,
          paymentStatus: nextPayment,
        },
      }),
    ]);

    const updated = await this.prisma.kitPickupRequest.findFirstOrThrow({
      where: { id: row.id, userId },
      include: REQUEST_INCLUDE,
    });

    return { data: toKitPickupRequestDto(updated) };
  }

  async cancel(userId: string, id: string): Promise<KitPickupRequestResponse> {
    const row = await this.prisma.kitPickupRequest.findFirst({
      where: { id, userId },
      include: REQUEST_INCLUDE,
    });

    if (!row) {
      throw this.notFound();
    }

    if (row.status === KitPickupRequestStatus.CANCELLED) {
      return { data: toKitPickupRequestDto(row) };
    }

    // Participant may cancel before physical pickup (Phase 2.1).
    const cancellable: KitPickupRequestStatus[] = [
      KitPickupRequestStatus.TERM_PENDING,
      KitPickupRequestStatus.TERM_ACCEPTED,
      KitPickupRequestStatus.PAYMENT_PENDING,
      KitPickupRequestStatus.PAID,
      KitPickupRequestStatus.WAIVED,
      KitPickupRequestStatus.PICKUP_PENDING,
    ];

    if (!cancellable.includes(row.status)) {
      throw this.error(
        HttpStatus.CONFLICT,
        "CANCEL_NOT_ALLOWED",
        "Cancelamento não permitido neste estado.",
      );
    }

    const updated = await this.prisma.kitPickupRequest.update({
      where: { id: row.id },
      data: { status: KitPickupRequestStatus.CANCELLED },
      include: REQUEST_INCLUDE,
    });

    return { data: toKitPickupRequestDto(updated) };
  }

  private notFound(): HttpException {
    return this.error(
      HttpStatus.NOT_FOUND,
      "NOT_FOUND",
      "Solicitação não encontrada.",
    );
  }

  private error(status: number, code: string, message: string): HttpException {
    return new HttpException(
      {
        status: "error",
        error: { code, message, status },
      },
      status,
    );
  }
}
