import { Injectable, NotFoundException , BadRequestException , ForbiddenException} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForumPost } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreatePostDto): Promise<ForumPost> {
    if (!dto.content && (!dto.image_urls || dto.image_urls.length === 0)) {
      throw new BadRequestException('Post must have either content or at least one image.');
    }

    return this.prisma.forumPost.create({
      data: {
        user_id: userId,
        content: dto.content,
        image_urls: dto.image_urls || [],
        category: dto.category,
      },
    });
  }

  async findAll(): Promise<ForumPost[]> {
    return this.prisma.forumPost.findMany({
      orderBy: { created_at: 'desc' },
      include: { user: true },
    });
  }

  async findOne(userId: number,id: number): Promise<ForumPost> {
    const post = await this.prisma.forumPost.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.user.account_type === 'PRIVATE') {
      // Check if the current user is following the post's author
      const isFollowing = await this.prisma.follow.findFirst({
        where: {
          follower_id: userId,
          followed_id: post.user.id,
        },
      });
      console.log("hello");
      
      console.log(isFollowing);
      
      // If the user is not following the profile, deny access
      if (!isFollowing) {
        throw new ForbiddenException('This post is private. You must follow the user to view it.');
      }
    }
    
    return post;
  }

  async update(id: number, dto: UpdatePostDto): Promise<ForumPost> {
    const post = await this.prisma.forumPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.forumPost.update({
      where: { id },
      data: {
        content: dto.content,
        image_urls: dto.image_urls,
        category: dto.category,
      },
    });
  }

  async remove(id: number): Promise<ForumPost> {
    const post = await this.prisma.forumPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.forumPost.delete({ where: { id } });
  }
}
