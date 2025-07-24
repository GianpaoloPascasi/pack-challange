import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import * as bcrypt from "bcrypt";
import { decode, sign, verify } from "jsonwebtoken";
import { User } from "../user/user.interface";

@Injectable()
export class AuthService {
  constructor(private db: DatabaseService) {}

  async login(username: string, password: string) {
    const user = await this.db
      .getDb()
      .selectFrom("users")
      .selectAll()
      .where("username", "=", username)
      .executeTakeFirstOrThrow();
    if (!(await this.compareHash(password, user.password))) {
      throw new UnauthorizedException("Wrong_password");
    }
    const jwt = sign({ ...user, password: undefined }, process.env.JWT_SECRET);
    return { jwt };
  }

  async genHash(content: string): Promise<string> {
    return new Promise((res, rej) => {
      bcrypt.hash(
        content,
        parseInt(process.env.BCRYPT_ROUNDS ?? 12),
        (err, hash) => {
          if (err) {
            rej(err);
          }
          res(hash);
        },
      );
    });
  }

  async compareHash(clear: string, hash: string): Promise<boolean> {
    return new Promise((res, rej) => {
      bcrypt.compare(clear, hash, (err, ok) => {
        if (err) {
          rej(err);
        }
        res(ok);
      });
    });
  }

  async signup(username: string, password: string) {
    if (!username && username.length < 5) {
      throw new BadRequestException("Username_too_short");
    }

    if (!password && password.length < 5) {
      throw new BadRequestException("Password_too_short");
    }

    const existing = await this.db
      .getDb()
      .selectFrom("users")
      .selectAll()
      .where("username", "=", username)
      .executeTakeFirst();

    if (existing) {
      throw new BadRequestException("Username_already_in_use");
    }

    const hash = await this.genHash(password);
    const user = await this.db
      .getDb()
      .insertInto("users")
      .values({
        password: hash,
        username,
      })
      .returning(["id", "username"])
      .executeTakeFirst();
    return user;
  }

  checkToken(token: string): User {
    if (!verify(token, process.env.JWT_SECRET)) {
      throw new UnauthorizedException("Invalid_JWT");
    }
    return decode(token) as User;
  }
}
