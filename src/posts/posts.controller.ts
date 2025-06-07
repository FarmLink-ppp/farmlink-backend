import { Controller, Get, Post, Body, Patch, Param, Delete , UseGuards, Req} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/types/auth.types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { log } from 'util';
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: RequestWithUser) {
    const userId = req.user.id; 
      return this.postsService.create(userId, createPostDto);

  }


  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('feed')
  getFeed(@Req() req: RequestWithUser) {
    return this.postsService.getFeed(req.user.id);
  }

  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserPosts(@Req() req: RequestWithUser) {
    return this.postsService.getUserPosts(req.user.id);
  }

  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me/shared-posts')
  getUserSharedPosts(@Req() req: RequestWithUser) {
    return this.postsService.getUserSharedPosts(req.user.id);
  }

  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('comment/:postId')  // postId is now a route parameter
  async createComment(
    @Param('postId') postId: number,  // Capture postId from the route
    @Body() dto: CreateCommentDto,    // The dto now only contains comment data
    @Req() req: RequestWithUser       // Get user info from the request object
  ) {
    return this.postsService.createComment(req.user.id, postId, dto);
  }


  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/like/:postId')
  likePost(@Req() req, @Param('postId') postId: string) {
  return this.postsService.likePost(req.user.id, parseInt(postId));
}


  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('like/:postId')
  unlikePost(@Param('postId') postId: string, @Req() req: RequestWithUser) {
    return this.postsService.unlikePost(req.user.id, Number(postId));
  }

  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('share/:postId')  // postId is now part of the route parameter
  async sharePost(
    @Param('postId') postId: number,  // Capture postId from the route
    @Req() req: RequestWithUser       // Get user info from the request object
  ) {
    // Call the service method with the userId and postId
    return await this.postsService.sharePost(req.user.id, postId);
  }
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('share/:postId')
  unsharePost(@Param('postId') postId: string, @Req() req: RequestWithUser) {
    return this.postsService.unsharePost(req.user.id, Number(postId));
  }

  @Patch('/comment/:commentId')
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser
  ) {
    return this.postsService.updateComment(
      req.user.id,
      commentId,
      updateCommentDto
    );
  }

  @Delete('/comment/:commentId')
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('commentId') commentId: number,
    @Req() req: RequestWithUser
  ) {
    return this.postsService.deleteComment(
      req.user.id,
      commentId,
    );
  }


  @Get('/comments/:postId')
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  getPostComments(@Param('postId') postId: string) {
    return this.postsService.getPostComments(Number(postId));
  }

  @Get('/likes/:postId')
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  getPostLikes(@Param('postId') postId: string) {
    return this.postsService.getPostLikes(Number(postId));
  }

  @Get('/shares/:postId')
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  getPostShares(@Param('postId') postId: string) {
    return this.postsService.getPostShares(Number(postId));
  }
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number, @Req() req: RequestWithUser) {
    return this.postsService.findOne(req.user.id,id);
  }
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}