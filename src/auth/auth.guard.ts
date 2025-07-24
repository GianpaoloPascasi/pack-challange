import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { decode, verify } from "jsonwebtoken";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    if (type !== "Bearer") {
      throw new UnauthorizedException("Auth_method_not_supported");
    }
    if (!verify(token, process.env.JWT_SECRET)) {
      return false;
    }
    request["user"] = decode(token);
    return true;
  }
}
