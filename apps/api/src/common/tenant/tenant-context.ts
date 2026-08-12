import { AsyncLocalStorage } from "node:async_hooks";
import { EntityManager, QueryRunner } from "typeorm";

export interface TenantStore {
  tenantId: string;
  userId: string;
  queryRunner: QueryRunner;
}

/**
 * Carries the current request's tenant-scoped QueryRunner through the call
 * stack without prop-drilling it into every service method. Set once per
 * request by TenantInterceptor (after `SET LOCAL app.tenant_id` has run on
 * that connection), read by tenantManager() wherever a repository call
 * needs to happen inside the RLS-scoped transaction.
 */
export const tenantContext = new AsyncLocalStorage<TenantStore>();

/**
 * The EntityManager every tenant-scoped repository call must use — its
 * underlying connection already has `app.tenant_id` set for this request,
 * so Postgres RLS enforces isolation regardless of what the query itself
 * filters on. Throws outside of a request context (e.g. a misplaced
 * bootstrap script) rather than silently falling back to an unscoped
 * connection.
 */
export function tenantManager(): EntityManager {
  const store = tenantContext.getStore();
  if (!store) {
    throw new Error(
      "tenantManager() called outside of a tenant-scoped request — is TenantInterceptor registered?",
    );
  }
  return store.queryRunner.manager;
}

export function currentTenantId(): string {
  const store = tenantContext.getStore();
  if (!store) throw new Error("No tenant context on this request.");
  return store.tenantId;
}

export function currentUserId(): string {
  const store = tenantContext.getStore();
  if (!store) throw new Error("No tenant context on this request.");
  return store.userId;
}
