import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // ── Build the base error body ──────────────────────────────────────────
    const errorBody: Record<string, unknown> = {
      statusCode : status,
      timestamp  : new Date().toISOString(),
      path       : request.url,
      message    :
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message
          : exceptionResponse,
    };

    // ── Forward validation errors array when present ───────────────────────
    // This is set by the exceptionFactory in ValidationPipe (main.ts).
    // Shape: { field: string; message: string }[]
    if (
      typeof exceptionResponse === 'object' &&
      Array.isArray((exceptionResponse as any).errors)
    ) {
      errorBody['errors'] = (exceptionResponse as any).errors;
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}\n${JSON.stringify(errorBody)}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(errorBody);
  }
}
