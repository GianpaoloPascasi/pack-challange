import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { File } from "../files/interfaces/file.interface";
import { FileRoles } from "../files/interfaces/file_roles.interface";
import * as dotenv from "dotenv";
import { Resource } from "sst";

if (process.env.NODE_ENV) {
  dotenv.config({
    path: ".env." + process.env.NODE_ENV,
  });
} else {
  dotenv.config();
}

const dialect = new PostgresDialect({
  pool: new Pool({
    database: Resource.PackPSQLDb.database ?? process.env.DATABASE_NAME,
    host: Resource.PackPSQLDb.host ?? process.env.DATABASE_HOST,
    user: Resource.PackPSQLDb.username ?? process.env.DATABASE_USER,
    password: Resource.PackPSQLDb.password ?? process.env.DATABASE_PASSWORD,
    port: Resource.PackPSQLDb.port ?? process.env.DATABASE_PORT ?? 5434,
    max: process.env.DATABASE_POOL ?? 10,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<{ files: File; files_roles: FileRoles }>({
  dialect,
});
