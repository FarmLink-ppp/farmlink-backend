import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RequestWithUser } from 'src/common/types/auth.types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';
@Auth()
@ApiController('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: RequestWithUser) {
    return this.postsService.create(req.user.id, createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('feed')
  getFeed(@Req() req: RequestWithUser) {
    return this.postsService.getFeed(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.postsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.update(id, req.user.id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.postsService.remove(id, req.user.id);
  }

  @Post('comment/:postId')
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.createComment(req.user.id, postId, dto);
  }

  @Patch('comment/:commentId')
  updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.updateComment(
      req.user.id,
      commentId,
      updateCommentDto,
    );
  }

  @Delete('comment/:commentId')
  deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.deleteComment(req.user.id, commentId);
  }

  @Get('comments/:postId')
  getPostComments(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPostComments(postId);
  }

  @Post('like/:postId')
  likePost(
    @Req() req: RequestWithUser,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postsService.likePost(req.user.id, postId);
  }

  @Delete('like/:postId')
  unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.unlikePost(req.user.id, postId);
  }

  @Get('likes/:postId')
  getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPostLikes(postId);
  }

  @Post('share/:postId')
  async sharePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return await this.postsService.sharePost(req.user.id, postId);
  }

  @Delete('share/:postId')
  unsharePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.unsharePost(req.user.id, postId);
  }

  @Get('shares/:postId')
  getPostShares(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPostShares(postId);
  }

  @Post('save/:postId')
  async savePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return await this.postsService.savePost(req.user.id, postId);
  }

  @Delete('save/:postId')
  unsavePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.unsavePost(req.user.id, postId);
  }

  @Get('saves/:postId')
  getPostSaves(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPostSaves(postId);
  }
}
