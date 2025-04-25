import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { AccountType, FollowStatus } from '@prisma/client';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async followUser(followerId: number, followedId: number) {
    const userToFollow = await this.usersService.findBy(
      { id: followedId },
      { account_type: true },
    );

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        follower_id_followed_id: {
          follower_id: followerId,
          followed_id: followedId,
        },
      },
    });
    if (existingFollow)
      throw new ConflictException(
        'Already following this user or have a pending request',
      );

    const status =
      userToFollow!.account_type === AccountType.PUBLIC
        ? FollowStatus.ACCEPTED
        : FollowStatus.PENDING;

    const follow = await this.prisma.follow.create({
      data: {
        follower_id: followerId,
        followed_id: followedId,
        status,
      },
    });
    return {
      id: follow.id,
      status,
      message:
        status === FollowStatus.ACCEPTED
          ? 'Followed successfully'
          : 'Follow request sent',
    };
  }

  async unfollowUser(followerId: number, followedId: number) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        follower_id_followed_id: {
          follower_id: followerId,
          followed_id: followedId,
        },
      },
    });
    if (!follow) throw new ConflictException('You are not following this user');

    await this.prisma.follow.delete({
      where: {
        id: follow.id,
      },
    });

    return {
      message: 'Unfollowed successfully',
    };
  }

  async getFollowing(userId: number) {
    try {
      return await this.prisma.follow.findMany({
        where: {
          follower_id: userId,
          status: FollowStatus.ACCEPTED,
        },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              full_name: true,
              profile_image: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error fetching following users',
      );
    }
  }

  async getFollowers(userId: number) {
    try {
      return await this.prisma.follow.findMany({
        where: {
          followed_id: userId,
          status: FollowStatus.ACCEPTED,
        },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              full_name: true,
              profile_image: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error fetching followers');
    }
  }

  async getFollowRequests(userId: number) {
    return await this.prisma.follow.findMany({
      where: {
        followed_id: userId,
        status: FollowStatus.PENDING,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            full_name: true,
            profile_image: true,
          },
        },
      },
    });
  }

  async respondToFollowRequest(
    userId: number,
    requestId: number,
    status: FollowStatus,
  ) {
    const followRequest = await this.prisma.follow.findUnique({
      where: {
        id: requestId,
      },
    });
    if (!followRequest) throw new NotFoundException('Follow request not found');

    if (followRequest.followed_id !== userId)
      throw new ForbiddenException('You are not authorized to respond');

    if (followRequest.status !== FollowStatus.PENDING)
      throw new BadRequestException('Request already processed');

    const updatedFollow = await this.prisma.follow.update({
      where: {
        id: requestId,
      },
      data: {
        status,
      },
    });

    return {
      id: updatedFollow.id,
      status: updatedFollow.status,
      message:
        status === FollowStatus.ACCEPTED
          ? 'Follow request accepted'
          : 'Follow request rejected',
    };
  }
}
