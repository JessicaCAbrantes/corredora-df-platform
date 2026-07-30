import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthBoundaryService } from "./auth.boundary";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SESSION_COOKIE_NAME } from "./session-cookie";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authBoundary: AuthBoundaryService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ data: { user: { id: string; email: string } } }> {
    const clientIp =
      request.ip ?? request.socket?.remoteAddress ?? "unknown";
    const result = await this.authService.login(
      body.email,
      body.password,
      clientIp,
    );
    response.cookie(result.cookieName, result.token, result.cookieOptions);
    return {
      data: {
        user: result.user,
      },
    };
  }

  @Get("me")
  async me(
    @Req() request: Request,
  ): Promise<{ data: { id: string; email: string } }> {
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

    const user = await this.authService.getMe(userId);
    return { data: user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    const options = this.authService.logoutCookieOptions();
    response.cookie(SESSION_COOKIE_NAME, "", options);
  }
}
