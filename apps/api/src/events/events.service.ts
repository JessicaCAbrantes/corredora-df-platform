import {
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import {
  EventLifecycleStatus,
  EventRegistrationStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { ListEventsQueryDto } from "./dto/list-events-query.dto";
import {
  buildEventsOrderBy,
  buildEventsWhere,
  buildMeta,
  toEventDetailsDto,
  toEventDto,
  toMyKitItemDto,
  toMyRegistrationItemDto,
} from "./events.mapper";
import type {
  EventDetailsResponse,
  EventsListResponse,
  MyKitsResponse,
  MyRegistrationsResponse,
  RegisterForEventResponse,
} from "./events.types";

function apiError(
  status: HttpStatus,
  code: string,
  message: string,
): never {
  throw new HttpException(
    {
      status: "error",
      error: {
        code,
        message,
        status,
      },
    },
    status,
  );
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListEventsQueryDto): Promise<EventsListResponse> {
    const page = query.page;
    const perPage = query.perPage;
    const where = buildEventsWhere(query);
    const orderBy = buildEventsOrderBy(query);
    const skip = (page - 1) * perPage;

    const [total, rows] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
    ]);

    return {
      data: rows.map(toEventDto),
      meta: buildMeta(page, perPage, total),
    };
  }

  async getBySlug(slug: string): Promise<EventDetailsResponse> {
    const event = await this.prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      apiError(HttpStatus.NOT_FOUND, "EVENT_NOT_FOUND", "Evento não encontrado.");
    }

    return { data: toEventDetailsDto(event) };
  }

  /**
   * List registrations for the authenticated user only.
   * userId must come from Real Auth Boundary — never from the client.
   */
  async listMyRegistrations(userId: string): Promise<MyRegistrationsResponse> {
    const rows = await this.prisma.eventRegistration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: rows.map(toMyRegistrationItemDto),
    };
  }

  /**
   * List kits for events the authenticated user is registered in.
   * userId must come from Real Auth Boundary — never from the client.
   * Distinct from EventDetailsDto.kit marketing stub.
   */
  async listMyKits(userId: string): Promise<MyKitsResponse> {
    const rows = await this.prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          include: { kit: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = [];
    for (const row of rows) {
      if (!row.event.kit) {
        continue;
      }
      data.push(
        toMyKitItemDto({
          event: {
            ...row.event,
            kit: row.event.kit,
          },
        }),
      );
    }

    return { data };
  }

  /**
   * Register the authenticated user for an event by persistent Event.id.
   * Never resolves slug. userId comes from Auth Boundary (not body).
   */
  async register(
    eventId: string,
    userId: string,
  ): Promise<RegisterForEventResponse> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      apiError(HttpStatus.NOT_FOUND, "EVENT_NOT_FOUND", "Evento não encontrado.");
    }

    if (
      event.status === EventLifecycleStatus.cancelled ||
      event.status === EventLifecycleStatus.completed
    ) {
      apiError(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "EVENT_INACTIVE",
        "Este evento não está ativo para inscrição.",
      );
    }

    if (event.registrationStatus !== EventRegistrationStatus.open) {
      apiError(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "EVENT_REGISTRATION_CLOSED",
        "Inscrições encerradas para esta corrida.",
      );
    }

    try {
      const registration = await this.prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          userId,
        },
      });

      return {
        data: {
          registrationId: registration.id,
        },
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        apiError(
          HttpStatus.CONFLICT,
          "ALREADY_REGISTERED",
          "Usuário já está inscrito nesta corrida.",
        );
      }
      throw error;
    }
  }

  /**
   * Cancel the authenticated user's registration for an event (hard delete).
   * Never resolves slug. userId comes from Auth Boundary (not body).
   * Ownership: delete only where { eventId, userId }.
   */
  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      apiError(HttpStatus.NOT_FOUND, "EVENT_NOT_FOUND", "Evento não encontrado.");
    }

    const result = await this.prisma.eventRegistration.deleteMany({
      where: {
        eventId: event.id,
        userId,
      },
    });

    if (result.count === 0) {
      apiError(
        HttpStatus.NOT_FOUND,
        "REGISTRATION_NOT_FOUND",
        "Inscrição não encontrada.",
      );
    }
  }
}
