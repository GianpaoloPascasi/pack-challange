import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { createMulterFile } from "../src/utils/create-multer-file";
import { FilesModule } from "../src/files/files.module";
import { FilesService } from "../src/files/files.service";
import { db } from "../src/utils/db";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();

    db.insertInto("files").values([{
        title: ,
        description: ,
        category: ,
        language: ,
        provider: ,
        roles: ,
        file: ,
        mimeType: ,
    }, {}]);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  //   it("should validate a jpg pristine file", async () => {
  //     const file = await createMulterFile(
  //       `${__dirname}../../test_files/clippy.jpg`,
  //     );
  //     console.log(file);
  //     const res = service.validateUploadedFile(file);
  //     expect(res).toBe(true);

  //     return request(app.getHttpServer()).post("/upload")..expect(200);
  //   });

  it("should validate a jpg pristine file", async () => {
    const file = await createMulterFile(
      `${__dirname}../../test_files/clippy.jpg`,
    );
    const res = app.get<FilesService>(FilesService).validateUploadedFile(file);
    expect(res).toBe(true);
  });

  //   it("should not validate a pdf with jpg signature", async () => {
  //     const file = await createMulterFile(
  //       `${__dirname}../../test_files/clippy.pdf`,
  //     );
  //     console.log(file, __dirname);
  //     const res = service.validateUploadedFile(file);
  //     expect(res).toBe(true);
  //   });

  //   it("should upload file", () => {
  //     const f = {} as Express.Multer.File;
  //     const req = service.uploadFile(f);
  //     void expect(req).resolves.toBeTruthy();
  //   });
});
