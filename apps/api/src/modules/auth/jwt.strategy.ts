import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtUser } from "../../common/decorators/current-user.decorator";

interface JwtPayload {
  sub: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
