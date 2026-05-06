import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  async use(request: any, _response: any, next: () => void) {
    try {
      const authorization = request.headers.authorization as string | undefined;

      if (!authorization?.startsWith("Bearer ")) {
        throw new UnauthorizedException("Missing bearer token");
      }

      const token = authorization.slice(7);
      const jwksUrl = process.env.SUPABASE_JWKS_URL;
      const issuer = process.env.SUPABASE_ISSUER;
      const audience = process.env.SUPABASE_AUDIENCE;

      if (!jwksUrl || !issuer || !audience) {
        throw new UnauthorizedException("Auth configuration is incomplete");
      }

      const jwks = createRemoteJWKSet(new URL(jwksUrl));
      const { payload } = await jwtVerify(token, jwks, { issuer, audience });

      request.currentUser = payload;
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";

      if (
        message.includes("exp") &&
        message.includes("timestamp check failed")
      ) {
        throw new UnauthorizedException(
          "Session has expired. Please sign in again.",
        );
      }

      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}
