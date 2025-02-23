import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected database error occurred';

    // Handle specific Prisma errors
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = `Duplicate field value: ${JSON.stringify(exception.meta)}`;
        break;

      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'The requested record was not found';
        break;

      case 'P2014': // Relation constraint violation
        status = HttpStatus.BAD_REQUEST;
        message =
          'Cannot delete or update as it would violate a foreign key constraint';
        break;

      case 'P2003': // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference: Foreign key constraint failed';
        break;

      case 'P2011': // Null constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Null constraint violation: A required field is missing';
        break;

      case 'P2000': // Value too long for column
        status = HttpStatus.BAD_REQUEST;
        message = `Value too long for a column: ${JSON.stringify(exception.meta)}`;
        break;

      default:
        message = exception.message;
        break;
    }

    response.status(status).json({
      statusCode: status,
      error: 'Database Error',
      message,
    });
  }
}
