import {
  Get,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RequestWithUser } from 'src/common/types/auth.types';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FollowStatus } from '@prisma/client';

@Auth()
@ApiController('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':followedId')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({
    status: 201,
    description: 'Follow request sent or user followed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot follow yourself',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Already following this user or have a pending request',
  })
  @ApiParam({
    name: 'followedId',
    description: 'ID of the user to follow',
    type: Number,
  })
  followUser(
    @Param('followedId', ParseIntPipe) followedId: number,
    @Req() req: RequestWithUser,
  ) {
    const followerId = req.user.id;
    if (followerId === followedId) {
      throw new BadRequestException('Cannot follow yourself');
    }
    return this.followService.followUser(followerId, followedId);
  }

  @Delete(':followedId')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({
    status: 200,
    description: 'Unfollowed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot unfollow yourself',
  })
  @ApiResponse({
    status: 409,
    description: 'You are not following this user',
  })
  unfollowUser(
    @Param('followedId', ParseIntPipe) followedId: number,
    @Req() req: RequestWithUser,
  ) {
    const followerId = req.user.id;
    if (followerId === followedId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }
    return this.followService.unfollowUser(followerId, followedId);
  }

  @Get('followers')
  @ApiOperation({ summary: 'Get all followers' })
  @ApiResponse({
    status: 200,
    description: 'List of followers',
  })
  findAllFollowers(@Req() req: RequestWithUser) {
    return this.followService.getFollowers(req.user.id);
  }

  @Get('following')
  @ApiOperation({ summary: 'Get all users you are following' })
  @ApiResponse({
    status: 200,
    description: 'List of following returned',
  })
  findAllFollowing(@Req() req: RequestWithUser) {
    return this.followService.getFollowing(req.user.id);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get all follow requests' })
  @ApiResponse({
    status: 200,
    description: 'List of follow requests returned',
  })
  getAllFollowRequests(@Req() req: RequestWithUser) {
    return this.followService.getFollowRequests(req.user.id);
  }

  @Post('requests/:requestId/accept')
  @ApiOperation({ summary: 'Accept a follow request' })
  @ApiResponse({
    status: 200,
    description: 'Follow request accepted',
  })
  @ApiResponse({
    status: 400,
    description: 'Request processed',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to accept this request',
  })
  @ApiResponse({
    status: 404,
    description: 'Follow request not found',
  })
  acceptFollowRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Req() req: RequestWithUser,
  ) {
    const followerId = req.user.id;
    return this.followService.respondToFollowRequest(
      followerId,
      requestId,
      FollowStatus.ACCEPTED,
    );
  }

  @Post('requests/:requestId/reject')
  @ApiOperation({ summary: 'Reject a follow request' })
  @ApiResponse({
    status: 200,
    description: 'Follow request rejected',
  })
  @ApiResponse({
    status: 404,
    description: 'Follow request not found',
  })
  @ApiResponse({
    status: 409,
    description: 'You are already following this user',
  })
  rejectFollowRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Req() req: RequestWithUser,
  ) {
    const followerId = req.user.id;
    return this.followService.respondToFollowRequest(
      followerId,
      requestId,
      FollowStatus.REJECTED,
    );
  }
}
