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
import { LikePostDto } from './dto/like-post.dto';
import { SharePostDto } from './dto/share-post.dto';
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
  @Post('comment')
  createComment(@Body() dto: CreateCommentDto, @Req() req: RequestWithUser) {
    return this.postsService.createComment(req.user.id, dto);
  }

  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('like')
  likePost(@Body() dto: LikePostDto, @Req() req: RequestWithUser) {
    return this.postsService.likePost(req.user.id, dto);
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
  @Post('share')
  sharePost(@Body() dto: SharePostDto, @Req() req: RequestWithUser) {
    return this.postsService.sharePost(req.user.id, dto);
  }
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('share/:postId')
  unsharePost(@Param('postId') postId: string, @Req() req: RequestWithUser) {
    return this.postsService.unsharePost(req.user.id, Number(postId));
  }

  @Get(':postId/comments')
  getPostComments(@Param('postId') postId: string) {
    return this.postsService.getPostComments(Number(postId));
  }

  @Get(':postId/likes')
  getPostLikes(@Param('postId') postId: string) {
    return this.postsService.getPostLikes(Number(postId));
  }

  @Get(':postId/shares')
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