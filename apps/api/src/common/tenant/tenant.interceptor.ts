import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { Observable, from, firstValueFrom } from "rxjs";
import { tenantContext } from "./tenant-context";

interface AuthedRequest {
  user?: { tenantId: string; userId: string };
}

/**
 * Runs every authenticated request inside one transaction on a connection
 * that has `app.tenant_id` set via `SET LOCAL` — the same setting every
 * table's RLS policy (§4 / §11) checks. This is the belt to the RBAC
 * guard's suspenders: even a service that forgets to filter by tenantId
 * still can't see another tenant's rows, because Postgres itself won't
 * return them on this connection.
 *
 * Public routes (no `request.user` — e.g. login) pass through untouched.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (!req.user) {
      return next.handle();
    }

    const { tenantId, userId } = req.user;

    return from(this.runInTenantTransaction(tenantId, userId, next));
  }

  private async runInTenantTransaction(
    tenantId: string,
    userId: string,
    next: CallHandler,
  ): Promise<unknown> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // Parameterized SET LOCAL isn't supported by Postgres — tenantId is a
    // server-issued UUID (never raw user input), so this is safe, but any
    // future caller must keep it that way.
    await queryRunner.query(`SET LOCAL app.tenant_id = '${tenantId}'`);

    try {
      const result = await tenantContext.run(
        { tenantId, userId, queryRunner },
        () => firstValueFrom(next.handle()),
      );
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
