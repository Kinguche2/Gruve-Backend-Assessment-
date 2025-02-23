import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: any) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        throw new ConflictException(
          `A record with this value already exists. (${error.meta?.target})`,
        );
      case 'P2003': // Foreign key constraint failed
        throw new BadRequestException(
          `Invalid reference: ${JSON.stringify(error.meta)}`,
        );
      case 'P2025': // Record not found
        throw new NotFoundException('Record not found.');
      default:
        throw new InternalServerErrorException('Database error occurred.');
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException('Invalid data provided.');
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new InternalServerErrorException('Database connection failed.');
  } else {
    throw new InternalServerErrorException('Unexpected error occurred.');
  }
}
