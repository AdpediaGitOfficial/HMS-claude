import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { diskStorage } from "multer";
import type { Request } from "express";

export const PATIENT_PHOTOS_DIR = join(process.cwd(), "uploads", "patients");

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

/**
 * Disk storage config for the patient photo upload. The filename is always
 * server-generated (a random UUID + the extension implied by the *verified*
 * mimetype) — the client's original filename is never used for anything
 * beyond display, so it can't be used for path traversal or to overwrite
 * another file. `fileFilter` rejects anything outside the image allow-list
 * before it's written to disk at all.
 */
export const patientPhotoMulterOptions = {
  storage: diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, dest: string) => void) => {
      if (!existsSync(PATIENT_PHOTOS_DIR)) mkdirSync(PATIENT_PHOTOS_DIR, { recursive: true });
      cb(null, PATIENT_PHOTOS_DIR);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const ext = ALLOWED_MIME_TYPES[file.mimetype] ?? extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(new BadRequestException("Only PNG, JPEG, or WEBP images are allowed."), false);
      return;
    }
    cb(null, true);
  },
};
