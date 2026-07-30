import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { AuthBoundaryService } from "../auth/auth.boundary";
import type { Env } from "../config/env.validation";
import { assertKitPickupOperator } from "./assert-kit-pickup-operator";
import { HandoverDto, ListOperationsQueryDto } from "./dto/operations.dto";
import { KitPickupOperationsService } from "./kit-pickup-operations.service";
import type {
  OperationalRequestResponse,
  OperationsListResponse,
} from "./kit-pickup-operations.types";

@Controller("kit-pickup-requests")
export class KitPickupOperationsController {
  constructor(
    private readonly operations: KitPickupOperationsService,
    private readonly config: ConfigService<Env, true>,
    private readonly authBoundary: AuthBoundaryService,
  ) {}

  @Get("operations")
  async list(
    @Req() request: Request,
    @Query() query: ListOperationsQueryDto,
  ): Promise<OperationsListResponse> {
    this.requireOperator(request);
    return this.operations.list(query);
  }

  @Post(":id/pickup")
  @HttpCode(HttpStatus.OK)
  async pickup(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<OperationalRequestResponse> {
    const operatorId = this.requireOperator(request);
    return this.operations.pickup(operatorId, id);
  }

  @Post(":id/take-into-custody")
  @HttpCode(HttpStatus.OK)
  async takeIntoCustody(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<OperationalRequestResponse> {
    const operatorId = this.requireOperator(request);
    return this.operations.takeIntoCustody(operatorId, id);
  }

  @Post(":id/ready")
  @HttpCode(HttpStatus.OK)
  async ready(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<OperationalRequestResponse> {
    const operatorId = this.requireOperator(request);
    return this.operations.ready(operatorId, id);
  }

  @Post(":id/handover")
  @HttpCode(HttpStatus.OK)
  async handover(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() body: HandoverDto,
  ): Promise<OperationalRequestResponse> {
    const operatorId = this.requireOperator(request);
    return this.operations.handover(operatorId, id, body);
  }

  private requireOperator(request: Request): string {
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

    const allowlist = this.config.get("KIT_PICKUP_OPERATOR_USER_IDS", {
      infer: true,
    });
    assertKitPickupOperator(userId, allowlist);
    return userId;
  }
}
