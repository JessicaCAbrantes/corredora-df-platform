import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Body,
  Req,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { AuthBoundaryService } from "../auth/auth.boundary";
import type { Env } from "../config/env.validation";
import { getCorrelationId } from "../observability/correlation-context";
import { PaymentsService } from "../payments/payments.service";
import { CreateKitPickupRequestDto } from "./dto/create-kit-pickup-request.dto";
import { KitPickupRequestsService } from "./kit-pickup-requests.service";
import type {
  CreatePaymentResponse,
  CurrentTermResponse,
  KitPickupRequestListResponse,
  KitPickupRequestResponse,
} from "./kit-pickup-requests.types";

@Controller("kit-pickup-requests")
export class KitPickupRequestsController {
  constructor(
    private readonly requestsService: KitPickupRequestsService,
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService<Env, true>,
    private readonly authBoundary: AuthBoundaryService,
  ) {}

  @Get("term")
  getTerm(): CurrentTermResponse {
    return this.requestsService.getCurrentTerm();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: Request,
    @Body() body: CreateKitPickupRequestDto,
  ): Promise<KitPickupRequestResponse> {
    const userId = this.requireUser(request);
    return this.requestsService.create(userId, body);
  }

  @Get("me")
  async listMine(@Req() request: Request): Promise<KitPickupRequestListResponse> {
    const userId = this.requireUser(request);
    return this.requestsService.listMine(userId);
  }

  @Get(":id")
  async getOne(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<KitPickupRequestResponse> {
    const userId = this.requireUser(request);
    return this.requestsService.getMine(userId, id);
  }

  @Post(":id/accept-term")
  @HttpCode(HttpStatus.OK)
  async acceptTerm(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<KitPickupRequestResponse> {
    const userId = this.requireUser(request);
    return this.requestsService.acceptTerm(userId, id);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<KitPickupRequestResponse> {
    const userId = this.requireUser(request);
    return this.requestsService.cancel(userId, id);
  }

  @Post(":id/payment")
  @HttpCode(HttpStatus.OK)
  async startPayment(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<CreatePaymentResponse> {
    const userId = this.requireUser(request);
    const successUrl = this.config.get("PAYMENT_SUCCESS_URL", { infer: true });
    const cancelUrl = this.config.get("PAYMENT_CANCEL_URL", { infer: true });

    const result = await this.paymentsService.createCheckoutForRequest({
      userId,
      requestId: id,
      successUrl: `${successUrl}${successUrl.includes("?") ? "&" : "?"}requestId=${encodeURIComponent(id)}`,
      cancelUrl: `${cancelUrl}${cancelUrl.includes("?") ? "&" : "?"}requestId=${encodeURIComponent(id)}`,
      correlationId: getCorrelationId(),
    });

    return { data: result };
  }

  private requireUser(request: Request): string {
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
    return userId;
  }
}
