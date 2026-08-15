import "reflect-metadata";
import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true });

  // Uploaded patient photos (apps/api/src/modules/core/patients/patient-photo-upload.config.ts)
  // are served straight off disk — same "/uploads/..." URL in dev and prod,
  // no separate object-storage setup needed at this scale.
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`HMS API listening on :${port}`);
}

bootstrap();
