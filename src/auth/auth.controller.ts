import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { AuthGuard } from "./auth.guard";
import { User } from "../user/user.interface";
import { SqlNotFoundInterceptorInterceptor } from "../sql-not-found-interceptor/sql-not-found-interceptor.interceptor";

@Controller("auth")
@UseInterceptors(SqlNotFoundInterceptorInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post("login")
  login(
    @Body("username") username: string,
    @Body("password") password: string,
    @Req() request: Request,
  ) {
    const [, token] = request.headers.authorization?.split(" ") ?? [];
    if (token) {
      try {
        const user = this.authService.checkToken(token);
        return user;
      } catch (e) {
        if (!(e instanceof UnauthorizedException)) {
          throw e;
        }
      }
    }
    return this.authService.login(username, password);
  }

  @Post("signup")
  signup(
    @Body("username") username: string,
    @Body("password") password: string,
  ) {
    return this.authService.signup(username, password);
  }

  @UseGuards(AuthGuard)
  @Get("account")
  account(@Req() request: Request): User {
    return request["user"] as User;
  }
}
