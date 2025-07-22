import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDTO } from './interfaces/file.interface';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateFileDTO,
  ) {}

  @Get()
  getAllFiles() {}

  @Get('file/:id')
  getFileById(@Param('id') id: number) {
    return id;
  }

  @Get('stats')
  getStats() {}
}
