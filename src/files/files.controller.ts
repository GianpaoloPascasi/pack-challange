import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateFileDTO } from "./dto/create-file.dto";
import { FilesService } from "./files.service";
import { validateCreateFileDTO } from "./validators/file.validator";

@Controller("files")
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateFileDTO,
  ) {
    if (!validateCreateFileDTO(body)) {
      throw new BadRequestException();
    }
    return await this.filesService.uploadAndCreateFile(file, body, 1);
  }

  @Get()
  async getAllFiles(
    @Query("page") page: number,
    @Query("itemsPerPage") itemsPerPage: number,
  ) {
    return await this.filesService.getAllFiles(page, itemsPerPage);
  }

  @Get("download/:id")
  async downloadFileById(@Param("id") id: number): Promise<StreamableFile> {
    return await this.filesService.downloadFileById(id);
  }

  @Get("stats")
  async getStats() {
    return await this.filesService.getStats();
  }
}
