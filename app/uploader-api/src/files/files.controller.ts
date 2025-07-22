import { Controller, Get, Post } from '@nestjs/common';

@Controller('files')
export class FilesController {
  @Post('upload')
  upload() {}

  @Get()
  getAllFiles() {}

  @Get('file/{id}')
  getFileById(id: number) {
    return id;
  }
}
