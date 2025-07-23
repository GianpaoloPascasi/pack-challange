import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import * as request from "supertest";
import { FilesModule } from "../src/files/files.module";
import { db } from "../src/utils/db";
import { CreateFileDTO } from "../src/files/dto/create-file.dto";
import { sql } from "kysely";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await sql`truncate table files restart identity cascade;`.execute(db);
  });

  it("should upload file", async () => {
    const res = await request(app.getHttpServer())
      .post("/files/upload")
      .set("Content-Type", "multipart/form-data")
      .attach("file", "test/fixtures/clippy.jpg")
      .field("category", 1)
      .field("description", "Test")
      .field("language", 1)
      .field("provider", 1)
      .field("roles", [1, 2])
      .field("title", "Test")
      .field("uploaded_by", 1);

    expect(res.status).toBe(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.id).toBeGreaterThan(0);
  });

  it("should not upload a file with invalid signature", async () => {
    const res = await request(app.getHttpServer())
      .post("/files/upload")
      .set("Content-Type", "multipart/form-data")
      .attach("file", "test/fixtures/clippy.pdf") //this is a jpg with a pdf extension, same as uploading an exe with a pdf extension
      .field("category", 1)
      .field("description", "Test")
      .field("language", 1)
      .field("provider", 1)
      .field("roles", [1, 2])
      .field("title", "Test")
      .field("uploaded_by", 1);
    expect(res.status).toBe(400);
  });

  it("should retrieve all files", async () => {
    await db
      .insertInto("files")
      .values([
        {
          title: "",
          description: "",
          category: 1,
          language: 1,
          provider: 1,
          file: "aa-png",
          mimetype: "image/png",
          uploaded_by: 1,
        },
        {
          title: "",
          description: "",
          category: 1,
          language: 1,
          provider: 1,
          file: "aa-png",
          mimetype: "image/png",
          uploaded_by: 1,
        },
      ])
      .execute();

    await db
      .insertInto("files_roles")
      .values([
        {
          file_id: 1,
          role_id: 1,
        },
        {
          file_id: 1,
          role_id: 2,
        },
        {
          file_id: 2,
          role_id: 1,
        },
        {
          file_id: 2,
          role_id: 2,
        },
      ])
      .execute();

    return request(app.getHttpServer())
      .get("/files")
      .query("page=1")
      .query("itemsPerPage=10")
      .send()
      .expect(200)
      .expect((res) => (res.body as CreateFileDTO[]).length == 2)
      .expect((res) => (res.body as CreateFileDTO[])[0].roles.length == 2);
  });
});
