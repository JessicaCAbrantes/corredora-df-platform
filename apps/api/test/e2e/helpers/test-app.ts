import { RequestMethod, ValidationPipe, type INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "../../../src/app.module";
import type { Env } from "../../../src/config/env.validation";
import { UnhandledExceptionFilter } from "../../../src/filters/unhandled-exception.filter";
import { ValidationExceptionFilter } from "../../../src/filters/validation-exception.filter";
import { correlationIdMiddleware } from "../../../src/observability/correlation-middleware";

export async function createTestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService<Env, true>);

  app.use(correlationIdMiddleware);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.setGlobalPrefix("api/v1", {
    exclude: [
      { path: "health", method: RequestMethod.GET },
      { path: "health/live", method: RequestMethod.GET },
      { path: "health/ready", method: RequestMethod.GET },
    ],
  });

  app.enableCors({
    origin: config.get("CORS_ORIGIN", { infer: true }),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(
    new UnhandledExceptionFilter(),
    new ValidationExceptionFilter(),
  );
  await app.init();
  return app;
}
