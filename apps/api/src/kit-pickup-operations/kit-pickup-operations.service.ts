import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  EventRegistrationMode,
  KitPickupRequestStatus,
  type Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { HandoverDto, ListOperationsQueryDto } from "./dto/operations.dto";
import { toOperationalRequestDto } from "./kit-pickup-operations.mapper";
import type {
  OperationalRequestResponse,
  OperationsListResponse,
} from "./kit-pickup-operations.types";

const INCLUDE = {
  kitPickupService: { include: { event: true } },
  participant: true,
  termAcceptance: true,
} as const;

@Injectable()
export class KitPickupOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListOperationsQueryDto): Promise<OperationsListResponse> {
    const serviceFilter: Prisma.KitPickupServiceWhereInput = {};

    if (query.eventId) {
      serviceFilter.eventId = query.eventId;
    }

    if (query.registrationMode) {
      serviceFilter.event = {
        registrationMode:
          query.registrationMode === "external"
            ? EventRegistrationMode.external
            : EventRegistrationMode.internal,
      };
    }

    const where: Prisma.KitPickupRequestWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (Object.keys(serviceFilter).length > 0) {
      where.kitPickupService = serviceFilter;
    }

    const orderBy = {
      [query.sort]: query.order,
    } as Prisma.KitPickupRequestOrderByWithRelationInput;
    const skip = (query.page - 1) * query.perPage;

    const [total, rows] = await Promise.all([
      this.prisma.kitPickupRequest.count({ where }),
      this.prisma.kitPickupRequest.findMany({
        where,
        orderBy,
        skip,
        take: query.perPage,
        include: INCLUDE,
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.perPage);

    return {
      data: rows.map((row) => toOperationalRequestDto(row)),
      meta: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1 && totalPages > 0,
      },
    };
  }

  async pickup(
    operatorId: string,
    id: string,
  ): Promise<OperationalRequestResponse> {
    const row = await this.findOrThrow(id);

    if (row.status === KitPickupRequestStatus.PICKED_UP) {
      return { data: toOperationalRequestDto(row) };
    }

    if (
      row.status === KitPickupRequestStatus.IN_CUSTODY ||
      row.status === KitPickupRequestStatus.READY_FOR_HANDOVER ||
      row.status === KitPickupRequestStatus.DELIVERED
    ) {
      throw this.conflict(
        "INVALID_STATUS",
        "Retirada não permitida neste estado.",
      );
    }

    const eligible: KitPickupRequestStatus[] = [
      KitPickupRequestStatus.PAID,
      KitPickupRequestStatus.WAIVED,
      KitPickupRequestStatus.PICKUP_PENDING,
    ];

    if (!eligible.includes(row.status)) {
      throw this.conflict(
        "INVALID_STATUS",
        "Retirada não permitida neste estado.",
      );
    }

    const now = new Date();
    const updated = await this.prisma.kitPickupRequest.update({
      where: { id: row.id },
      data: {
        status: KitPickupRequestStatus.PICKED_UP,
        pickedUpAt: row.pickedUpAt ?? now,
        pickedUpBy: row.pickedUpBy ?? operatorId,
      },
      include: INCLUDE,
    });

    return { data: toOperationalRequestDto(updated) };
  }

  async takeIntoCustody(
    operatorId: string,
    id: string,
  ): Promise<OperationalRequestResponse> {
    const row = await this.findOrThrow(id);

    if (row.status === KitPickupRequestStatus.IN_CUSTODY) {
      return { data: toOperationalRequestDto(row) };
    }

    if (row.status !== KitPickupRequestStatus.PICKED_UP) {
      throw this.conflict(
        "INVALID_STATUS",
        "Custódia exige kit já retirado.",
      );
    }

    const now = new Date();
    const updated = await this.prisma.kitPickupRequest.update({
      where: { id: row.id },
      data: {
        status: KitPickupRequestStatus.IN_CUSTODY,
        custodyAt: row.custodyAt ?? now,
        custodyBy: row.custodyBy ?? operatorId,
      },
      include: INCLUDE,
    });

    return { data: toOperationalRequestDto(updated) };
  }

  async ready(
    operatorId: string,
    id: string,
  ): Promise<OperationalRequestResponse> {
    const row = await this.findOrThrow(id);

    if (row.status === KitPickupRequestStatus.READY_FOR_HANDOVER) {
      return { data: toOperationalRequestDto(row) };
    }

    if (row.status !== KitPickupRequestStatus.IN_CUSTODY) {
      throw this.conflict(
        "INVALID_STATUS",
        "Pronto para entrega exige kit em custódia.",
      );
    }

    const now = new Date();
    const updated = await this.prisma.kitPickupRequest.update({
      where: { id: row.id },
      data: {
        status: KitPickupRequestStatus.READY_FOR_HANDOVER,
        readyAt: row.readyAt ?? now,
        readyBy: row.readyBy ?? operatorId,
      },
      include: INCLUDE,
    });

    return { data: toOperationalRequestDto(updated) };
  }

  async handover(
    operatorId: string,
    id: string,
    body: HandoverDto,
  ): Promise<OperationalRequestResponse> {
    const receivedByName = body.receivedByName?.trim();
    if (!receivedByName) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Informe quem recebeu o kit.",
            status: 400,
            details: [
              {
                field: "receivedByName",
                message: "receivedByName is required",
              },
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const row = await this.findOrThrow(id);

    if (row.status === KitPickupRequestStatus.DELIVERED) {
      return { data: toOperationalRequestDto(row) };
    }

    if (row.status !== KitPickupRequestStatus.READY_FOR_HANDOVER) {
      throw this.conflict(
        "INVALID_STATUS",
        "Entrega exige status pronto para entrega.",
      );
    }

    const now = new Date();
    const updated = await this.prisma.kitPickupRequest.update({
      where: { id: row.id },
      data: {
        status: KitPickupRequestStatus.DELIVERED,
        deliveredAt: row.deliveredAt ?? now,
        deliveredBy: row.deliveredBy ?? operatorId,
        receivedByName: row.receivedByName ?? receivedByName,
        handoverNotes:
          body.notes !== undefined
            ? body.notes.trim() || null
            : row.handoverNotes,
      },
      include: INCLUDE,
    });

    return { data: toOperationalRequestDto(updated) };
  }

  private async findOrThrow(id: string) {
    const row = await this.prisma.kitPickupRequest.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!row) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "NOT_FOUND",
            message: "Solicitação não encontrada.",
            status: 404,
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  private conflict(code: string, message: string): HttpException {
    return new HttpException(
      {
        status: "error",
        error: { code, message, status: 409 },
      },
      HttpStatus.CONFLICT,
    );
  }
}
