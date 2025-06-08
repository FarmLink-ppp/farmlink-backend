import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from './../prisma/prisma.service';
import { AccountType, PostComment } from '@prisma/client';
import { FeedAlgorithmService } from './feed-algorithm.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feedAlgorithm: FeedAlgorithmService,
  ) {}

  async create(userId: number, dto: CreatePostDto) {
    if (!dto.content && (!dto.image_urls || dto.image_urls.length === 0)) {
      throw new BadRequestException(
        'Post must have either content or at least one image.',
      );
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

  async findAll() {
    return this.prisma.forumPost.findMany({
      orderBy: { created_at: 'desc' },
      include: { user: true },
    });
  }

  async findOne(userId: number, postId: number, action: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: postId },
      include: { user: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.checkPrivatePostAccess(userId, post, action);

    return post;
  }

  async update(id: number, userId: number, dto: UpdatePostDto) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id, user_id: userId },
    });
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

  async remove(id: number, userId: number) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id, user_id: userId },
    });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.forumPost.delete({ where: { id } });
  }

  async getFeed(userId: number) {
    // 1. Get all users the current user is following
    const following = await this.prisma.follow.findMany({
      where: { follower_id: userId },
      select: { followed_id: true },
    });

    const followingIds = following.map((f) => f.followed_id);

    // 2. Get posts from:
    //    - Followed users (both public and private accounts)
    //    - Non-followed users with PUBLIC accounts only
    //    - Include shares, likes, and comments
    const posts = await this.prisma.forumPost.findMany({
      where: {
        OR: [
          {
            // Posts from followed users (including their private posts)
            user_id: { in: followingIds },
          },
          {
            // Public posts from non-followed users
            user: {
              account_type: AccountType.PUBLIC,
              id: { notIn: followingIds }, // Not already followed
            },
          },
        ],
      },
      include: {
        user: true,
        likes: true,
        comments: true,
        shares: true, // Include shares in the ranking
      },
      orderBy: { created_at: 'desc' },
    });

    // 3. Create a map of followed users for quick lookup
    const followingMap = following.reduce(
      (acc, curr) => {
        acc[curr.followed_id] = true;
        return acc;
      },
      {} as Record<number, boolean>,
    );

    // 4. Filter out private posts from non-followed users (extra safety)
    const filteredPosts = posts.filter(
      (post) =>
        post.user.account_type === AccountType.PUBLIC ||
        followingMap[post.user_id],
    );

    // 5. Rank the posts using our algorithm (now including shares)
    return this.feedAlgorithm.getRankedFeed(filteredPosts, followingMap);
  }

  async createComment(
    userId: number,
    postId: number,
    dto: CreateCommentDto,
  ): Promise<PostComment> {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.checkPrivatePostAccess(userId, post, 'comment on');

    return this.prisma.postComment.create({
      data: {
        content: dto.content,
        user_id: userId,
        post_id: postId,
      },
    });
  }

  async updateComment(
    userId: number,
    commentId: number,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user is the one who created the comment
    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this comment',
      );
    }

    // Update and return the comment
    return this.prisma.postComment.update({
      where: { id: commentId },
      data: {
        content: dto.content, // Assuming you want to only update content
      },
    });
  }

  async deleteComment(userId: number, commentId: number) {
    // Find the comment
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user is the one who created the comment
    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }

    // Delete the comment
    await this.prisma.postComment.delete({
      where: { id: commentId },
    });
  }

  async likePost(userId: number, postId: number) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.postLike.findFirst({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    if (existingLike) {
      throw new BadRequestException('Post already liked');
    }

    await this.checkPrivatePostAccess(userId, post, 'like');

    return this.prisma.postLike.create({
      data: {
        user_id: userId,
        post_id: postId,
      },
    });
  }

  async unlikePost(userId: number, postId: number) {
    const like = await this.prisma.postLike.findFirst({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.postLike.delete({
      where: { id: like.id },
    });
  }

  async sharePost(userId: number, postId: number) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingShare = await this.prisma.sharedPost.findFirst({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    if (existingShare) {
      throw new BadRequestException('Post already shared');
    }

    await this.checkPrivatePostAccess(userId, post, 'share');

    const sharedPost = await this.prisma.sharedPost.create({
      data: {
        user_id: userId,
        post_id: postId,
      },
    });

    return sharedPost;
  }

  async unsharePost(userId: number, postId: number) {
    const share = await this.prisma.sharedPost.findFirst({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    await this.prisma.sharedPost.delete({
      where: { id: share.id },
    });
  }

  async getPostInteractions(
    userId: number,
    postId: number,
    model: 'postComment' | 'postLike' | 'sharedPost',
    action: string,
  ) {
    await this.findOne(userId, postId, action);

    const baseQuery = {
      where: { post_id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            account_type: true,
            profile_image: true,
          },
        },
      },
    };

    switch (model) {
      case 'postComment':
        return this.prisma.postComment.findMany({
          ...baseQuery,
          orderBy: { created_at: 'desc' },
        });
      case 'postLike':
        return this.prisma.postLike.findMany(baseQuery);
      case 'sharedPost':
        return this.prisma.sharedPost.findMany(baseQuery);
      default:
        throw new BadRequestException('Invalid model type');
    }
  }

  private async checkPrivatePostAccess(
    userId: number,
    post: any,
    action: string,
  ) {
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      post.user.account_type === AccountType.PRIVATE &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      post.user_id !== userId
    ) {
      const isFollowing = await this.prisma.follow.findFirst({
        where: {
          follower_id: userId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          followed_id: post.user.id,
        },
      });

      if (!isFollowing) {
        throw new ForbiddenException(
          `Cannot ${action} private post. You must follow the user first.`,
        );
      }
    }
  }
  
  async getTotalPostsCount() {
    return this.prisma.forumPost.count();
  }


}
