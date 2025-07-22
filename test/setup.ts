if (!process.env.DATABASE_HOST) {
  process.env.DATABASE_HOST = "localhost";
  process.env.DATABASE_NAME = "files";
  process.env.DATABASE_USER = "user";
  process.env.DATABASE_PASSWORD = "password";
  process.env.DATABASE_PORT = 5432;
  process.env.DATABASE_POOL = 10;
}
