import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RequestWithUser } from 'src/common/types/auth.types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Auth()
@ApiController('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('image_urls', 10, {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'uploads', 'posts'),
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
          cb(null, fileName);
        },
      }),
      fileFilter(req, file, cb) {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp|gif)$/i)) {
          return cb(
            new BadRequestException(
              'Only image files are allowed (jpg, jpeg, png, webp, gif)',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1 * 1024 * 1024,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'This is a post' },
        category: { type: 'string', example: 'DISCUSSIONS' },
        image_urls: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Images to upload (jpg, jpeg, png, webp, gif)',
        },
      },
      required: ['category'],
    },
  })
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: RequestWithUser,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls =
      Array.isArray(files) && files.length > 0
        ? files.map((f) => `${baseUrl}/uploads/posts/${f.filename}`)
        : [];
    return this.postsService.create(req.user.id, {
      ...createPostDto,
      image_urls: imageUrls,
    });
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('feed')
  getFeed(@Req() req: RequestWithUser) {
    return this.postsService.getFeed(req.user.id);
  }

  @Get('me')
  getUserPosts(@Req() req: RequestWithUser) {
    return this.postsService.getUserPosts(req.user.id);
  }

  @Get('me/shared-posts')
  getUserSharedPosts(@Req() req: RequestWithUser) {
    return this.postsService.getUserSharedPosts(req.user.id);
  }
    
  @Get('count')
  getTotalPostsCount() {
    return this.postsService.getTotalPostsCount();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.postsService.findOne(req.user.id, id, 'view');
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
  createComment(
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
  getPostComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.getPostInteractions(
      req.user.id,
      postId,
      'postComment',
      'view comments on',
    );
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
  getPostLikes(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.getPostInteractions(
      req.user.id,
      postId,
      'postLike',
      'view likes on',
    );
  }

  @Post('share/:postId')
  sharePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.sharePost(req.user.id, postId);
  }

  @Delete('share/:postId')
  unsharePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.unsharePost(req.user.id, postId);
  }

  @Get('shares/:postId')
  getPostShares(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.getPostInteractions(
      req.user.id,
      postId,
      'sharedPost',
      'view shares on',
    );
  }
}
