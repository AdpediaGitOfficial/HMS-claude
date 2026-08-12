import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";

/**
 * Marks a route with the permission string(s) it requires, e.g.
 * `@Permissions("billing.invoice.create")`. Checked by PermissionsGuard
 * against the caller's JWT-embedded permission list — new modules add new
 * permission strings (§11 migration governance) without touching this
 * decorator or the guard.
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
