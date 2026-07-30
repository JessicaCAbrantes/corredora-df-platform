import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthBoundaryService } from "../auth/auth.boundary";
import { ListEventsQueryDto } from "./dto/list-events-query.dto";
import { EventsService } from "./events.service";
import type {
  EventDetailsResponse,
  EventsListResponse,
  MyKitsResponse,
  MyRegistrationsResponse,
  RegisterForEventResponse,
} from "./events.types";

@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly authBoundary: AuthBoundaryService,
  ) {}

  @Get()
  list(@Query() query: ListEventsQueryDto): Promise<EventsListResponse> {
    return this.eventsService.list(query);
  }

  @Get("by-slug/:slug")
  getBySlug(@Param("slug") slug: string): Promise<EventDetailsResponse> {
    return this.eventsService.getBySlug(slug);
  }

  /**
   * GET /api/v1/events/me/registrations
   * Static path — registered before parametric :id routes.
   * Identity exclusively from Real Auth Boundary.
   */
  @Get("me/registrations")
  async listMyRegistrations(
    @Req() request: Request,
  ): Promise<MyRegistrationsResponse> {
    const userId = this.authBoundary.resolveCurrentUserId(request);

    if (!userId) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado.",
            status: 401,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.eventsService.listMyRegistrations(userId);
  }

  /**
   * GET /api/v1/events/me/kits
   * Kits / Retirada de Kits MVP — read-only kits for the authenticated user.
   * Static path — registered before parametric :id routes.
   * Identity exclusively from Real Auth Boundary.
   */
  @Get("me/kits")
  async listMyKits(@Req() request: Request): Promise<MyKitsResponse> {
    const userId = this.authBoundary.resolveCurrentUserId(request);

    if (!userId) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado.",
            status: 401,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.eventsService.listMyKits(userId);
  }

  /**
   * POST /api/v1/events/:id/register
   * `:id` is Event.id only — never slug.
   * userId comes from Real Auth Boundary (signed session cookie — not body).
   */
  @Post(":id/register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Param("id") id: string,
    @Req() request: Request,
  ): Promise<RegisterForEventResponse> {
    const userId = this.authBoundary.resolveCurrentUserId(request);

    if (!userId) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado.",
            status: 401,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.eventsService.register(id, userId);
  }

  /**
   * DELETE /api/v1/events/:id/register
   * Cancel registration MVP — hard delete of EventRegistration for session user.
   * `:id` is Event.id only — never slug / registrationId alone.
   * userId comes from Real Auth Boundary (not body/query).
   */
  @Delete(":id/register")
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelRegistration(
    @Param("id") id: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = this.authBoundary.resolveCurrentUserId(request);

    if (!userId) {
      throw new HttpException(
        {
          status: "error",
          error: {
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado.",
            status: 401,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.eventsService.cancelRegistration(id, userId);
  }
}
