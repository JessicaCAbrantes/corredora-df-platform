import type { NextFunction, Request, Response } from "express";
import {
  CORRELATION_ID_HEADER,
  resolveInboundCorrelationId,
  runWithCorrelationId,
} from "./correlation-context";

/**
 * Early Express middleware: one correlationId per HTTP request.
 * Reads `x-correlation-id` when valid; otherwise generates UUID.
 * Echoes the id on the response header.
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const correlationId = resolveInboundCorrelationId(
    req.headers[CORRELATION_ID_HEADER],
  );
  res.setHeader(CORRELATION_ID_HEADER, correlationId);
  runWithCorrelationId(correlationId, () => next());
}
