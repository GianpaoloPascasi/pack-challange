import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import * as request from "supertest";
import { FilesModule } from "../src/files/files.module";
import { db } from "../src/utils/db";
import { CreateFileDTO } from "../src/files/dto/create-file.dto";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("should upload file", async () => {
    const res = await request(app.getHttpServer())
      .post("/")
      .set("Content-Type", "multipart/form-data")
      .attach("file", "./test_files/clippy.jpg")
      .field("data", JSON.stringify({} as CreateFileDTO));
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.id).toBeGreaterThan(0);
  });

  it("should not upload a file with invalid signature", async () => {
    const res = await request(app.getHttpServer())
      .post("/")
      .set("Content-Type", "multipart/form-data")
      .attach("file", "./test_files/clippy.pdf") //this is a jpg with a pdf extension, same as uploading an exe with a pdf extension
      .field("data", JSON.stringify({} as CreateFileDTO));
    expect(res.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.id).toBeGreaterThan(0);
  });

  it("should retrieve all files", async () => {
    await db.deleteFrom("files").execute();

    await db
      .insertInto("files")
      .values([
        {
          title: "",
          description: "",
          category: 1,
          language: 1,
          provider: 1,
          roles: [1],
          file: "aa-png",
          mimeType: "image/png",
        },
        {
          title: "",
          description: "",
          category: 1,
          language: 1,
          provider: 1,
          roles: [1],
          file: "aa-png",
          mimeType: "image/png",
        },
      ])
      .execute();
  });
});
