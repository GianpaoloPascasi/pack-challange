import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateFileDTO } from "./dto/create-file.dto";
import { FilesService } from "./files.service";
import { validateCreateFileDTO } from "./validators/file.validator";
import { AuthGuard } from "../auth/auth.guard";
import { SqlNotFoundInterceptorInterceptor } from "../sql-not-found-interceptor/sql-not-found-interceptor.interceptor";
import { Request } from "express";
import { User } from "../user/user.interface";

@Controller("files")
@UseGuards(AuthGuard)
@UseInterceptors(SqlNotFoundInterceptorInterceptor)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateFileDTO,
    @Req() req: Request,
  ) {
    if (!validateCreateFileDTO(body)) {
      throw new BadRequestException();
    }
    return await this.filesService.uploadAndCreateFile(
      file,
      body,
      (req["user"] as User).id as number,
    );
  }

  @Get()
  async getAllFiles(
    @Query("page") page: number,
    @Query("itemsPerPage") itemsPerPage: number,
  ) {
    return await this.filesService.getAllFiles(page, itemsPerPage);
  }

  @Get("download/:id")
  async downloadFileById(@Param("id") id: number) {
    const url = await this.filesService.downloadFileById(id);
    return { url };
  }

  @Get("meta/:id")
  async fileMetaById(@Param("id") id: number) {
    return await this.filesService.fileMetaById(id);
  }

  @Get("stats")
  async getStats() {
    return await this.filesService.getStats();
  }
}
