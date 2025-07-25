import { Injectable } from "@nestjs/common";
import { Kysely, PostgresDialect } from "kysely";
import { FileRoles } from "../files/interfaces/file_roles.interface";
import { Pool } from "pg";
import { Resource } from "sst";
import { File } from "../files/interfaces/file.interface";
import { Category } from "../files/interfaces/category.interface";
import { Language } from "../files/interfaces/language.interface";
import { User } from "../user/user.interface";
import * as pg from "pg";

interface DatabaseTables {
  files: File;
  files_roles: FileRoles;
  categories: Category;
  languages: Language;
  users: User;
}

@Injectable()
export class DatabaseService {
  private db: Kysely<DatabaseTables>;

  constructor() {
    // force postgres to return actual int and not string at runtime
    const int8TypeId = 20;
    pg.types.setTypeParser(int8TypeId, (val) => parseInt(val, 10));

    const dialect = new PostgresDialect({
      pool: new Pool({
        database: process.env.DATABASE_NAME ?? Resource.PackPSQLDb.database,
        host: process.env.DATABASE_HOST ?? Resource.PackPSQLDb.host,
        user: process.env.DATABASE_USER ?? Resource.PackPSQLDb.username,
        password: process.env.DATABASE_PASSWORD ?? Resource.PackPSQLDb.password,
        port: process.env.DATABASE_PORT ?? Resource.PackPSQLDb.port ?? 5434,
        max: process.env.DATABASE_POOL ?? 10,
      }),
    });

    this.db = new Kysely<DatabaseTables>({
      dialect,
    });
  }

  getDb() {
    return this.db;
  }
}
