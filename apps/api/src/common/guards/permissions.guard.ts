import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { JwtUser } from "../decorators/current-user.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user: JwtUser }>();
    const user = request.user;
    const granted = new Set(user?.permissions ?? []);
    const ok = required.every((p) => granted.has(p));
    if (!ok) {
      throw new ForbiddenException(`Missing permission: ${required.filter((p) => !granted.has(p)).join(", ")}`);
    }
    return true;
  }
}
