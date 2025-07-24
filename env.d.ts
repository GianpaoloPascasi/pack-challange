export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PORT: string;
      NODE_ENV: "development" | "production" | "test";
      DATABASE_NAME: string;
      DATABASE_HOST: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_PORT?: number;
      DATABASE_POOL?: number;
      BUCKET_NAME: string;
      BCRYPT_ROUNDS: string;
      JWT_SECRET: string;
    }
  }
}
