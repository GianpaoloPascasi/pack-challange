import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV) {
  dotenv.config({
    path: ".env." + process.env.NODE_ENV,
  });
} else {
  dotenv.config();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
