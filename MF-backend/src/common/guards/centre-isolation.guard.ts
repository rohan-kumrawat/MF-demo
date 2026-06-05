import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';

/**
 * CentreIsolationGuard — Layer 2 of centre isolation.
 *
 * Strips `centreId` from the request body if a client tries to inject it.
 * Logs a warning for audit visibility.
 *
 * The authoritative centreId always comes from JWT (req.user.centreId),
 * never from the request payload.
 */
@Injectable()
export class CentreIsolationGuard implements CanActivate {
  private readonly logger = new Logger(CentreIsolationGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.body && 'centreId' in request.body) {
      this.logger.warn(
        `centreId injection attempt blocked — user: ${request.user?.sub}, path: ${request.url}`,
      );
      delete request.body.centreId;
    }

    if (request.query && 'centreId' in request.query) {
      delete request.query.centreId;
    }

    return true;
  }
}
