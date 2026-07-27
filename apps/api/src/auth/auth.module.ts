import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LoginAttemptLimiter } from "./login-attempt-limiter";

@Module({
  controllers: [AuthController],
  providers: [AuthService, LoginAttemptLimiter],
})
export class AuthModule {}
