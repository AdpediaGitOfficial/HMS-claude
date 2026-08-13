import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as loadEnv } from "dotenv";
import { entities } from "../config/typeorm.config";

loadEnv();

/**
 * Used only by the TypeORM CLI (migration:generate/run/revert) — the app
 * itself boots via TypeOrmModule in app.module.ts.
 *
 * The migrations glob is __dirname-relative and matches both extensions so
 * this file works unmodified in both places it runs: via ts-node against
 * src/database/migrations/*.ts in dev, and via plain `node` against the
 * tsc-compiled dist/database/migrations/*.js in production (see
 * apps/api/Dockerfile.prod) — no separate prod config needed.
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
});
