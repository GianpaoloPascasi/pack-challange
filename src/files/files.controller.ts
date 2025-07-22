import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateFileDTO } from "./dto/create-file.dto";
import { FilesService } from "./files.service";

@Controller("files")
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateFileDTO,
  ) {
    return await this.filesService.uploadAndCreateFile(file, data, 1);
  }

  @Get()
  async getAllFiles(
    @Query("page") page: number,
    @Query("itemsPerPage") itemsPerPage: number,
  ) {
    return await this.filesService.getAllFiles(page, itemsPerPage);
  }

  @Get("file/:id")
  async getFileById(@Param("id") id: number) {
    return await this.filesService.getFileById(id);
  }

  @Get("stats")
  async getStats() {
    return await this.filesService.getStats();
  }
}
