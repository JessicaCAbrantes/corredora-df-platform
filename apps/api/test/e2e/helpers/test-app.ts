import { RequestMethod, ValidationPipe, type INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../../src/app.module";
import type { Env } from "../../../src/config/env.validation";
import { ValidationExceptionFilter } from "../../../src/filters/validation-exception.filter";

export async function createTestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService<Env, true>);

  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
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

  app.useGlobalFilters(new ValidationExceptionFilter());
  await app.init();
  return app;
}
