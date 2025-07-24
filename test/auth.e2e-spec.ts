import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import * as request from "supertest";
import { DatabaseService } from "../src/database/database.service";
import { AuthModule } from "../src/auth/auth.module";
import { decode } from "jsonwebtoken";
import { User } from "../src/user/user.interface";

describe("AuthController (e2e)", () => {
  let app: INestApplication<App>;
  let lastJwt: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("should login default user", async () => {
    const res = await request(app.getHttpServer()).post("/auth/login").send({
      username: "user1",
      password: "m!Str0ngP4sswd",
    });

    expect(res.status).toBe(201);
    const jwt = (res.body as { jwt: string }).jwt;
    lastJwt = jwt;
    expect(jwt).toBeTruthy();
    const decoded = decode(jwt) as User;
    expect(decoded).toBeTruthy();
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe("user1");
  });

  it("should not login default user with wrong password", async () => {
    const res = await request(app.getHttpServer()).post("/auth/login").send({
      username: "user1",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect((res.body as { statusCode: number }).statusCode).toBe(401);
  });

  it("should not login unexisting user", async () => {
    const res = await request(app.getHttpServer()).post("/auth/login").send({
      username: "user1asdasd",
      password: "wrongpassword",
    });

    expect(res.status).toBe(404);
    expect((res.body as { statusCode: number }).statusCode).toBe(404);
  });

  it("should be allowed by guard", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/account")
      .set("Authorization", "Bearer " + lastJwt);

    expect(res.status).toBe(200);
    const decoded = res.body as User;
    expect(decoded).toBeTruthy();
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe("user1");
  });

  it("should be disallowed by guard", async () => {
    const res = await request(app.getHttpServer()).get("/auth/account");

    expect(res.status).toBe(401);
    expect((res.body as { statusCode: number }).statusCode).toBe(401);
  });

  it("should signup and login new user", async () => {
    await app
      .get<DatabaseService>(DatabaseService)
      .getDb()
      .deleteFrom("users")
      .where("id", ">", 1)
      .execute();

    const signup = await request(app.getHttpServer())
      .post("/auth/signup")
      .send({
        username: "user2",
        password: "m!Str0ngP4sswd",
      });

    expect(signup.status).toBe(201);
    const singupBody = signup.body as User;
    expect(singupBody.username).toBe("user2");

    const res = await request(app.getHttpServer()).post("/auth/login").send({
      username: "user2",
      password: "m!Str0ngP4sswd",
    });

    expect(res.status).toBe(201);
    const jwt = (res.body as { jwt: string }).jwt;
    lastJwt = jwt;
    expect(jwt).toBeTruthy();
    const decoded = decode(jwt) as User;
    expect(decoded).toBeTruthy();
    expect(decoded.id).toBe(singupBody.id);
    expect(decoded.username).toBe("user2");

    await app
      .get<DatabaseService>(DatabaseService)
      .getDb()
      .deleteFrom("users")
      .where("id", "=", singupBody.id as number)
      .execute();
  });

  it("should not signup an existing user", async () => {
    const signup = await request(app.getHttpServer())
      .post("/auth/signup")
      .send({
        username: "user1",
        password: "m!Str0ngP4sswd",
      });

    expect(signup.status).toBe(400);
    expect((signup.body as { statusCode: number }).statusCode).toBe(400);
  });
});
