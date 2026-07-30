import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

/**
 * Catches unexpected errors without leaking internals.
 * HttpException (including domain + validation envelopes) is preserved as-is.
 *
 * Structured logging / request IDs belong to FASE 3.5 Observability.
 */
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(body);
      return;
    }

    // Do not log message/stack — may contain secrets or Prisma internals (FASE 3.5: structured logger).
    console.error(
      "[UnhandledException]",
      exception instanceof Error ? exception.name : "Unknown",
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: "error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno do servidor",
        status: 500,
      },
    });
  }
}
