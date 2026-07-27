import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

type ValidationDetail = {
  field: string;
  message: string;
};

/**
 * Maps Nest ValidationPipe errors to docs/api/errors.md envelope.
 * Minimal — only VALIDATION_ERROR for this increment.
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    const details = extractDetails(exceptionResponse);

    response.status(HttpStatus.BAD_REQUEST).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos.",
        status: 400,
        details,
      },
    });
  }
}

function extractDetails(exceptionResponse: string | object): ValidationDetail[] {
  if (typeof exceptionResponse !== "object" || exceptionResponse === null) {
    return [];
  }

  const message = (exceptionResponse as { message?: unknown }).message;
  if (!Array.isArray(message)) {
    return [];
  }

  return message.map((entry) => {
    if (typeof entry !== "string") {
      return { field: "query", message: "Invalid value" };
    }
    const field = entry.split(" ")[0] ?? "query";
    return { field, message: entry };
  });
}
