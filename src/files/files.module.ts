import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { DatabaseService } from "../database/database.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  controllers: [FilesController],
  providers: [FilesService, DatabaseService],
  imports: [AuthModule],
})
export class FilesModule {}
