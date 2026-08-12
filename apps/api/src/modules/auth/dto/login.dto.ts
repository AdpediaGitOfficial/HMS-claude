import { IsEmail, IsString, IsUUID, MinLength } from "class-validator";

export class LoginDto {
  /**
   * In production this is resolved server-side from the request's
   * subdomain/host (§10 — "tenant resolved from JWT/subdomain on every
   * request"), not supplied by the client. Accepted here explicitly so the
   * scaffold's login endpoint is testable before that resolution middleware
   * exists — replace with host-based lookup before shipping multi-tenant
   * auth for real.
   */
  @IsUUID()
  tenantId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
