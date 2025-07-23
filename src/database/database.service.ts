import { Injectable } from "@nestjs/common";
import { Kysely, PostgresDialect } from "kysely";
import { FileRoles } from "../files/interfaces/file_roles.interface";
import { Pool } from "pg";
import { Resource } from "sst";
import { File } from "../files/interfaces/file.interface";
import { Category } from "../files/interfaces/category.interface";
import { Language } from "../files/interfaces/language.interface";

interface DatabaseTables {
  files: File;
  files_roles: FileRoles;
  categories: Category;
  languages: Language;
}

@Injectable()
export class DatabaseService {
  private db: Kysely<DatabaseTables>;

  constructor() {
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

    // Database interface is passed to Kysely's constructor, and from now on, Kysely
    // knows your database structure.
    // Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
    // to communicate with your database.
    this.db = new Kysely<DatabaseTables>({
      dialect,
    });
  }

  getDb() {
    return this.db;
  }
}
