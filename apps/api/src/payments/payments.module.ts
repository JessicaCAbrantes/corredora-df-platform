import { Inject, Injectable, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.validation";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { MockPaymentGateway } from "./mock-payment-gateway";
import type { PaymentGateway } from "./payment-gateway";
import { PaymentWebhookController } from "./payment-webhook.controller";
import { PaymentsService } from "./payments.service";
import { StripePaymentGateway } from "./stripe-payment-gateway";

export const PAYMENT_GATEWAY = Symbol("PAYMENT_GATEWAY");

@Injectable()
export class PaymentsServiceProvider extends PaymentsService {
  constructor(
    prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY) gateway: PaymentGateway,
    config: ConfigService<Env, true>,
  ) {
    super(prisma, gateway, {
      environment: config.get("NODE_ENV", { infer: true }),
    });
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [PaymentWebhookController],
  providers: [
    {
      provide: PAYMENT_GATEWAY,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): PaymentGateway => {
        const provider = config.get("PAYMENT_PROVIDER", { infer: true });
        if (provider === "stripe") {
          return new StripePaymentGateway({
            secretKey: config.get("STRIPE_SECRET_KEY", { infer: true })!,
            webhookSecret: config.get("STRIPE_WEBHOOK_SECRET", { infer: true })!,
          });
        }
        return new MockPaymentGateway({
          webhookSecret: config.get("PAYMENT_WEBHOOK_SECRET", { infer: true })!,
          publicApiBaseUrl: config.get("PUBLIC_API_BASE_URL", { infer: true }),
        });
      },
    },
    {
      provide: PaymentsService,
      useClass: PaymentsServiceProvider,
    },
  ],
  exports: [PaymentsService, PAYMENT_GATEWAY],
})
export class PaymentsModule {}
