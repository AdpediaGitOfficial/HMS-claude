import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { DataSource, In } from "typeorm";
import { LoginDto } from "./dto/login.dto";
import { User } from "../core/entities/user.entity";
import { UserRole } from "../core/entities/user-role.entity";
import { Role } from "../core/entities/role.entity";
import { RolePermission } from "../core/entities/role-permission.entity";
import { Permission } from "../core/entities/permission.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Login has no tenant context yet (no JWT to read it from), so this
    // is the one place that opens its own RLS-scoped transaction manually
    // instead of relying on TenantInterceptor — same mechanism, just
    // triggered by the resolved tenantId instead of an authenticated
    // request. See LoginDto for why tenantId is client-supplied for now.
    return this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${dto.tenantId}'`);

      const user = await manager.getRepository(User).findOne({
        where: { tenantId: dto.tenantId, email: dto.email, status: "active" },
      });
      if (!user) throw new UnauthorizedException("Invalid credentials");

      const valid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!valid) throw new UnauthorizedException("Invalid credentials");

      const userRoles = await manager.getRepository(UserRole).find({ where: { userId: user.id } });
      const roleIds = userRoles.map((ur) => ur.roleId);
      const roles = roleIds.length
        ? await manager.getRepository(Role).find({ where: { id: In(roleIds) } })
        : [];

      const rolePermissions = roleIds.length
        ? await manager.getRepository(RolePermission).find({ where: { roleId: In(roleIds) } })
        : [];
      const permissionIds = [...new Set(rolePermissions.map((rp) => rp.permissionId))];
      const permissions = permissionIds.length
        ? await manager.getRepository(Permission).find({ where: { id: In(permissionIds) } })
        : [];

      const payload = {
        sub: user.id,
        tenantId: user.tenantId,
        roles: roles.map((r) => r.key),
        permissions: permissions.map((p) => `${p.module}.${p.action}`),
      };

      return {
        accessToken: this.jwt.sign(payload),
        user: { id: user.id, name: user.name, email: user.email, roles: payload.roles },
      };
    });
  }
}
