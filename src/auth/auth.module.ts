import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DatabaseService } from "../database/database.service";
import { AuthGuard } from "./auth.guard";

@Module({
  providers: [AuthService, DatabaseService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthGuard],
})
export class AuthModule {}
