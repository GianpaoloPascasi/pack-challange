import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import * as request from "supertest";
import { FilesModule } from "../src/files/files.module";
import { CreateFileDTO } from "../src/files/dto/create-file.dto";
import { sql } from "kysely";
import { DatabaseService } from "../src/database/database.service";
import { File } from "../src/files/interfaces/file.interface";

describe("FilesController (e2e)", () => {
  let app: INestApplication<App>;
  let jwt: string;

  beforeEach(async () => {
    jest.mock("sst", () => ({
      Resource: { PackPSQLDb: { ...process.env } },
    }));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await sql`truncate table files restart identity cascade;`.execute(
      app.get<DatabaseService>(DatabaseService).getDb(),
    );

    const res = await request(app.getHttpServer()).post("/auth/login").send({
      username: "user1",
      password: "m!Str0ngP4sswd",
    });

    jwt = (res.body as { jwt: string }).jwt;
  });

  it("should upload file", async () => {
    const res = await request(app.getHttpServer())
      .post("/files/upload")
      .set("Content-Type", "multipart/form-data")
      .set("Authorization", "Bearer " + jwt)
      .attach("file", "test/fixtures/clippy.jpg")
      .field("category", 1)
      .field("description", "Test")
      .field("language", 1)
      .field("provider", 1)
      .field("roles", [1, 2])
      .field("title", "Test")
      .field("uploaded_by", 1);

    expect(res.status).toBe(201);
    const body = res.body as { id: number };
    expect(body.id).toBeGreaterThan(0);

    const download = await request(app.getHttpServer())
      .get("/files/download/" + body.id)
      .set("Authorization", "Bearer " + jwt)
      .send();

    expect(download.status).toBe(200);
    const url = (download.body as { url: string }).url;
    expect(url).toBeTruthy();
    expect(url.includes(process.env.BUCKET_NAME));

    const meta = await request(app.getHttpServer())
      .get("/files/meta/" + body.id)
      .set("Authorization", "Bearer " + jwt)
      .send();

    expect(meta.status).toBe(200);
    const file = meta.body as File;
    expect(file.uploaded_by).toBe(1);
  });

  it("should not find an unexisting file", async () => {
    const download = await request(app.getHttpServer())
      .get("/files/download/1000")
      .set("Authorization", "Bearer " + jwt)
      .send();

    expect(download.status).toBe(404);
  });

  it("should not upload a file with invalid signature", async () => {
    const res = await request(app.getHttpServer())
      .post("/files/upload")
      .set("Authorization", "Bearer " + jwt)
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
    await app
      .get<DatabaseService>(DatabaseService)
      .getDb()
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

    await app
      .get<DatabaseService>(DatabaseService)
      .getDb()
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
      .set("Authorization", "Bearer " + jwt)
      .query("page=1")
      .query("itemsPerPage=10")
      .send()
      .expect(200)
      .expect((res) => (res.body as CreateFileDTO[]).length == 2)
      .expect((res) => (res.body as CreateFileDTO[])[0].roles.length == 2);
  });
});
