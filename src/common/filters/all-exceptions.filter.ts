import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const { status, message } = this.normalizeException(exception);

    if (!(exception instanceof HttpException) && exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).send({
      success: false,
      message,
      data: null,
      timestamp: Date.now(),
    });
  }

  private normalizeException(exception: unknown): { status: number; message: string } {
    if (!(exception instanceof HttpException)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception instanceof Error ? exception.message : 'Internal server error',
      };
    }

    const body = exception.getResponse();
    if (typeof body === 'string') {
      return { status: exception.getStatus(), message: body };
    }

    if (body && typeof body === 'object') {
      const rawMessage = (body as Record<string, unknown>).message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : typeof rawMessage === 'string'
          ? rawMessage
          : exception.message;

      return { status: exception.getStatus(), message };
    }

    return { status: exception.getStatus(), message: exception.message };
  }
}
