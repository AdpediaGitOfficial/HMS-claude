import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { tenantManager } from "../../../common/tenant/tenant-context";

export type SafeUser = Omit<User, "passwordHash">;

@Injectable()
export class UsersService {
  /**
   * Explicitly select columns rather than `find()` + strip — passwordHash
   * never leaves the database in the response, not even transiently in
   * memory. The /users list is used for staff-picker dropdowns (e.g.
   * Appointments' doctor select), which is exactly the endpoint an
   * accidental `find()` here would have turned into a credential leak.
   */
  async list(): Promise<SafeUser[]> {
    return tenantManager()
      .getRepository(User)
      .find({
        select: ["id", "tenantId", "branchId", "name", "email", "phone", "status", "createdAt", "updatedAt"],
        order: { name: "ASC" },
      });
  }
}
