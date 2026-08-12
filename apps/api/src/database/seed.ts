import "reflect-metadata";
import * as bcrypt from "bcrypt";
import { AppDataSource } from "./data-source";
import { Tenant } from "../modules/platform/entities/tenant.entity";
import { Branch } from "../modules/platform/entities/branch.entity";
import { User } from "../modules/core/entities/user.entity";
import { Role } from "../modules/core/entities/role.entity";
import { Permission } from "../modules/core/entities/permission.entity";
import { RolePermission } from "../modules/core/entities/role-permission.entity";
import { UserRole } from "../modules/core/entities/user-role.entity";

/**
 * Seeds one demo tenant end-to-end (tenant → branch → permission catalog →
 * roles → admin user) so `pnpm --filter @hms/api seed` gives you something
 * to log in with immediately. Every module adds its own permission rows
 * here as it's built (§11) — this list is not meant to stay this short.
 */
const PERMISSIONS: Array<{ module: string; action: string; description: string }> = [
  { module: "core", action: "patients.read", description: "View patients" },
  { module: "core", action: "patients.create", description: "Register a patient" },
];

async function main() {
  const ds = await AppDataSource.initialize();

  await ds.transaction(async (manager) => {
    let tenant = await manager.getRepository(Tenant).findOne({ where: { name: "Sunrise Multispeciality" } });
    if (!tenant) {
      tenant = await manager.getRepository(Tenant).save(
        manager.getRepository(Tenant).create({ name: "Sunrise Multispeciality", plan: "trial", status: "active" }),
      );
    }
    await manager.query(`SET LOCAL app.tenant_id = '${tenant.id}'`);

    let branch = await manager.getRepository(Branch).findOne({ where: { tenantId: tenant.id, isPrimary: true } });
    if (!branch) {
      branch = await manager.getRepository(Branch).save(
        manager.getRepository(Branch).create({ tenantId: tenant.id, name: "City Branch", isPrimary: true }),
      );
    }

    const permissionRepo = manager.getRepository(Permission);
    const permissions: Permission[] = [];
    for (const p of PERMISSIONS) {
      let perm = await permissionRepo.findOne({ where: { module: p.module, action: p.action } });
      if (!perm) perm = await permissionRepo.save(permissionRepo.create(p));
      permissions.push(perm);
    }

    const roleRepo = manager.getRepository(Role);
    let adminRole = await roleRepo.findOne({ where: { tenantId: tenant.id, key: "admin" } });
    if (!adminRole) {
      adminRole = await roleRepo.save(roleRepo.create({ tenantId: tenant.id, key: "admin", name: "Admin" }));
    }

    const rolePermRepo = manager.getRepository(RolePermission);
    for (const perm of permissions) {
      const exists = await rolePermRepo.findOne({
        where: { tenantId: tenant.id, roleId: adminRole.id, permissionId: perm.id },
      });
      if (!exists) {
        await rolePermRepo.save(
          rolePermRepo.create({ tenantId: tenant.id, roleId: adminRole.id, permissionId: perm.id }),
        );
      }
    }

    const userRepo = manager.getRepository(User);
    let adminUser = await userRepo.findOne({ where: { tenantId: tenant.id, email: "admin@sunrise.test" } });
    if (!adminUser) {
      adminUser = await userRepo.save(
        userRepo.create({
          tenantId: tenant.id,
          branchId: branch.id,
          name: "Admin User",
          email: "admin@sunrise.test",
          passwordHash: await bcrypt.hash("ChangeMe123!", 10),
          status: "active",
        }),
      );
    }

    const userRoleRepo = manager.getRepository(UserRole);
    const hasRole = await userRoleRepo.findOne({
      where: { tenantId: tenant.id, userId: adminUser.id, roleId: adminRole.id },
    });
    if (!hasRole) {
      await userRoleRepo.save(
        userRoleRepo.create({ tenantId: tenant.id, userId: adminUser.id, roleId: adminRole.id }),
      );
    }

    // eslint-disable-next-line no-console
    console.log("Seeded tenant:", tenant.id);
    // eslint-disable-next-line no-console
    console.log("Login with: tenantId=%s email=admin@sunrise.test password=ChangeMe123!", tenant.id);
  });

  await ds.destroy();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
