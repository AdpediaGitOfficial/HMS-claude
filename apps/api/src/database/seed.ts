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
import { Ward } from "../modules/clinical/entities/ward.entity";
import { Bed } from "../modules/clinical/entities/bed.entity";

/**
 * Seeds one demo tenant end-to-end (tenant → branch → permission catalog →
 * roles → admin user) so `pnpm --filter @hms/api seed` gives you something
 * to log in with immediately. Every module adds its own permission rows
 * here as it's built (§11) — this list is not meant to stay this short.
 */
const PERMISSIONS: Array<{ module: string; action: string; description: string }> = [
  { module: "core", action: "patients.read", description: "View patients" },
  { module: "core", action: "patients.create", description: "Register a patient" },
  { module: "core", action: "users.read", description: "View staff directory" },
  { module: "clinical", action: "appointments.read", description: "View appointments" },
  { module: "clinical", action: "appointments.create", description: "Book an appointment" },
  { module: "clinical", action: "appointments.update", description: "Check in / update an appointment" },
  { module: "clinical", action: "encounters.read", description: "View encounters" },
  { module: "clinical", action: "encounters.update", description: "Close an encounter" },
  { module: "clinical", action: "ehr.read", description: "View clinical notes" },
  { module: "clinical", action: "ehr.create", description: "Add a clinical note" },
  { module: "clinical", action: "ipd.read", description: "View wards, beds, admissions" },
  { module: "clinical", action: "ipd.admit", description: "Admit a patient" },
  { module: "clinical", action: "ipd.discharge", description: "Discharge a patient" },
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

    // Demo doctor — reuses the admin role for now rather than seeding a
    // separate doctor-only permission subset; that split is real work for
    // whoever builds out full RBAC granularity, not a scaffold concern.
    let doctorUser = await userRepo.findOne({ where: { tenantId: tenant.id, email: "doctor@sunrise.test" } });
    if (!doctorUser) {
      doctorUser = await userRepo.save(
        userRepo.create({
          tenantId: tenant.id,
          branchId: branch.id,
          name: "Dr. Kabir Anand",
          email: "doctor@sunrise.test",
          passwordHash: await bcrypt.hash("ChangeMe123!", 10),
          status: "active",
        }),
      );
      await userRoleRepo.save(
        userRoleRepo.create({ tenantId: tenant.id, userId: doctorUser.id, roleId: adminRole.id }),
      );
    }

    // Wards + beds so the IPD bed board has something to show immediately.
    const wardRepo = manager.getRepository(Ward);
    const bedRepo = manager.getRepository(Bed);
    const wardSeed: Array<{ name: string; bedLabels: string[] }> = [
      { name: "General", bedLabels: ["G-01", "G-02", "G-03", "G-04"] },
      { name: "ICU", bedLabels: ["ICU-01", "ICU-02"] },
    ];
    for (const w of wardSeed) {
      let ward = await wardRepo.findOne({ where: { tenantId: tenant.id, name: w.name } });
      if (!ward) {
        ward = await wardRepo.save(wardRepo.create({ tenantId: tenant.id, branchId: branch.id, name: w.name }));
      }
      for (const label of w.bedLabels) {
        const exists = await bedRepo.findOne({ where: { tenantId: tenant.id, wardId: ward.id, label } });
        if (!exists) {
          await bedRepo.save(bedRepo.create({ tenantId: tenant.id, wardId: ward.id, label, status: "available" }));
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log("Seeded tenant:", tenant.id);
    // eslint-disable-next-line no-console
    console.log("Login with: tenantId=%s email=admin@sunrise.test password=ChangeMe123!", tenant.id);
    // eslint-disable-next-line no-console
    console.log("Demo doctor: doctor@sunrise.test / ChangeMe123! (id=%s)", doctorUser.id);
  });

  await ds.destroy();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
