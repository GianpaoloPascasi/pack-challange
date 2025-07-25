import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { AppService } from "./app.service";
import { NotFoundInterceptor } from "./not-found/not-found.interceptor";

@Controller()
@UseInterceptors(NotFoundInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }
}
