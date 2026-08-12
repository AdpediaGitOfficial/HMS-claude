import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as loadEnv } from "dotenv";
import { entities } from "../config/typeorm.config";

loadEnv();

/** Used only by the TypeORM CLI (migration:generate/run/revert) — the app itself boots via TypeOrmModule in app.module.ts. */
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
});
