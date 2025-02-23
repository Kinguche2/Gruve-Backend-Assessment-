import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { type User } from '@prisma/client';
import { UserDto } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(user: UserDto): Promise<User> {
    return this.prisma.user.create({
      data: user,
    });
  }

  async findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
