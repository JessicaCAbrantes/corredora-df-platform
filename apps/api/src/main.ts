import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import type { Env } from "./config/env.validation";
import { ValidationExceptionFilter } from "./filters/validation-exception.filter";

async function bootstrap() {
  // rawBody required for Stripe / mock webhook signature verification
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService<Env, true>);

  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

  app.enableCors({
    origin: config.get("CORS_ORIGIN", { infer: true }),
    // Registration Adapter sends credentials: "include" — required for the cookie-based Auth MVP later.
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

  const port = config.get("PORT", { infer: true });
  await app.listen(port);
}

void bootstrap();
