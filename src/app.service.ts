import { Injectable } from "@nestjs/common";
import * as fs from "fs";
@Injectable()
export class AppService {
  getHello(): any {
    const postmanData = fs.readFileSync("pack.postman_collection");
    return JSON.parse(postmanData.toString());
  }
}
