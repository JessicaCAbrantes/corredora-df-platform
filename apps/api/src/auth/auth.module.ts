import { Module } from "@nestjs/common";
import { AuthBoundaryService } from "./auth.boundary";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LoginAttemptLimiter } from "./login-attempt-limiter";

@Module({
  controllers: [AuthController],
  providers: [AuthService, LoginAttemptLimiter, AuthBoundaryService],
  exports: [AuthBoundaryService],
})
export class AuthModule {}
