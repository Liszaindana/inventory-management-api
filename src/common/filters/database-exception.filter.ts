import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface PostgresDriverError {
  code?: string;
  detail?: string;
  constraint?: string;
}

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const driverError = exception.driverError as
      PostgresDriverError | undefined;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada database';
    let error = 'Internal Server Error';

    switch (driverError?.code) {
      case '23505':
        status = HttpStatus.CONFLICT;
        message = 'Data dengan nilai unik tersebut sudah ada';
        error = 'Conflict';
        break;
      case '23503':
        status = HttpStatus.CONFLICT;
        message =
          'Data tidak dapat diproses karena masih digunakan atau tidak terhubung dengan data lain';
        error = 'Conflict';
        break;
      case '23502':
        status = HttpStatus.BAD_REQUEST;
        message = 'Field wajib tidak boleh kosong';
        error = 'Bad Request';
        break;
      case '23514':
        status = HttpStatus.BAD_REQUEST;
        message = 'Nilai melanggar aturan data';
        error = 'Bad Request';
        break;
      default:
        break;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
