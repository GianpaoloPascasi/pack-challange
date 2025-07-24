import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { AppService } from "./app.service";
import { SqlNotFoundInterceptorInterceptor } from "./sql-not-found-interceptor/sql-not-found-interceptor.interceptor";

@Controller()
@UseInterceptors(SqlNotFoundInterceptorInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }
}
