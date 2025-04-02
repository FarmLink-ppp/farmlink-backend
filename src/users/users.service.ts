import { PrismaService } from './../prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    await this.checkIfUserExists(createUserDto.email, createUserDto.username);

    // hash password
    const password_hash = await this.hashPassword(createUserDto.password);

    return await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        full_name: createUserDto.fullName,
        profile_image: createUserDto.profileImage,
        bio: createUserDto.bio,
        location: createUserDto.location,
        password_hash,
      },
      select: this.userSafeFields,
    });
  }

  async findBy(where: Prisma.UserWhereUniqueInput, select?: Prisma.UserSelect) {
    const user = await this.prisma.user.findUnique({
      where,
      select: { ...this.userSafeFields, ...select },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByCredentials(username: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: this.userSafeFields,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check if email or username already exists
    if (updateUserDto.email || updateUserDto.username)
      await this.checkIfUserExists(
        updateUserDto.email,
        updateUserDto.username,
        id,
      );
    // hash password if it is being updated
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        ...(updateUserDto.fullName && { full_name: updateUserDto.fullName }),
        ...(updateUserDto.profileImage && {
          profile_image: updateUserDto.profileImage,
        }),
        ...(updateUserDto.password && {
          password_hash: updateUserDto.password,
        }),
      },
      select: this.userSafeFields,
    });
  }

  async findByVerificationToken(token: string) {
    return await this.prisma.user.findFirst({
      where: { verify_token: token },
    });
  }

  async verifyUser(id: number): Promise<void> {
    const user = await this.findBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        verify_token: null,
        verify_token_expires: null,
      },
      select: this.userSafeFields,
    });
  }

  async updateVerificationToken(
    id: number,
    token: string,
    verificationTokenExpiration: Date | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        verify_token: token,
        verify_token_expires: verificationTokenExpiration,
      },
    });
  }

  async findByResetToken(token: string) {
    return await this.prisma.user.findFirst({
      where: { reset_pass_token: token },
    });
  }

  async updateResetToken(
    id: number,
    token: string | null,
    resetTokenExpiration: Date | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        reset_pass_token: token,
        reset_pass_expires: resetTokenExpiration,
      },
    });
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
    refreshTokenExpires: Date | null,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: refreshToken,
        refresh_token_expires: refreshTokenExpires,
      },
    });
  }

  async remove(id: number) {
    const user = await this.findBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.delete({
      where: { id },
      select: this.userSafeFields,
    });
  }

  private get userSafeFields() {
    return {
      id: true,
      username: true,
      email: true,
      full_name: true,
      profile_image: true,
      bio: true,
      location: true,
      is_verified: true,
      verify_token_expires: true,
      reset_pass_expires: true,
      created_at: true,
      updated_at: true,
    };
  }

  private async checkIfUserExists(
    email?: string,
    username?: string,
    excludeId?: number,
  ) {
    if (!email && !username) return;
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
    if (!existingUser) return;

    throw new ConflictException(
      'User with this email or username already exists',
    );
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
