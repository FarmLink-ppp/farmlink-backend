import { Injectable, NotFoundException , BadRequestException , ForbiddenException} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForumPost ,PostComment, PostLike, SavedPost, SharedPost } from '@prisma/client';
import { FeedAlgorithmService } from './feed-algorithm.service';
import { CreateCommentDto} from './dto/create-comment.dto';
@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feedAlgorithm: FeedAlgorithmService
  ) {}

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

  async findOne(userId: number,postId: number) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: postId },
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

  async getFeed(userId: number): Promise<ForumPost[]> {
    // 1. Get all users the current user is following
    const following = await this.prisma.follow.findMany({
      where: { follower_id: userId },
      select: { followed_id: true }
    });
    
    const followingIds = following.map(f => f.followed_id);
    
    // 2. Get posts from:
    //    - Followed users (both public and private accounts)
    //    - Non-followed users with PUBLIC accounts only
    //    - Include shares, likes, and comments
    const posts = await this.prisma.forumPost.findMany({
      where: {
        OR: [
          { 
            // Posts from followed users (including their private posts)
            user_id: { in: followingIds } 
          },
          { 
            // Public posts from non-followed users
            user: { 
              account_type: 'PUBLIC',
              id: { notIn: followingIds } // Not already followed
            } 
          }
        ]
      },
      include: {
        user: true,
        likes: true,
        comments: true,
        shares: true // Include shares in the ranking
      },
      orderBy: { created_at: 'desc' }
    });
  
    // 3. Create a map of followed users for quick lookup
    const followingMap = following.reduce((acc, curr) => {
      acc[curr.followed_id] = true;
      return acc;
    }, {} as Record<number, boolean>);
  
    // 4. Filter out private posts from non-followed users (extra safety)
    const filteredPosts = posts.filter(post => 
      post.user.account_type === 'PUBLIC' || 
      followingMap[post.user_id]
    );
  
    // 5. Rank the posts using our algorithm (now including shares)
    return this.feedAlgorithm.getRankedFeed(filteredPosts, userId, followingMap);
  }
  async createComment(userId: number, postId: number, dto: CreateCommentDto): Promise<PostComment> {
    // Check if post exists and is accessible
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },  // Use the postId passed as a parameter
      include: { user: true }
    });
  
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  
    // Check if post is private and user doesn't follow the author
    if (post.user.account_type === 'PRIVATE') {
      const isFollowing = await this.prisma.follow.findFirst({
        where: {
          follower_id: userId,
          followed_id: post.user.id
        }
      });
  
      if (!isFollowing) {
        throw new ForbiddenException('Cannot comment on private post');
      }
    }

    // Create and return the new comment
    return this.prisma.postComment.create({
      data: {
        content: dto.content,
        user_id: userId,
        post_id: postId  // Use the postId passed as a parameter
      }
    });
  }
  
  
  async updateComment(userId: number, commentId: number, dto: CreateCommentDto) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user is the one who created the comment
    if (comment.user_id !== userId) {
      throw new ForbiddenException('You are not authorized to update this comment');
    }

    // Update and return the comment
    return this.prisma.postComment.update({
      where: { id: commentId },
      data: {
        content: dto.content, // Assuming you want to only update content
      },
    });
  }
  async deleteComment(userId: number, commentId: number): Promise<void> {
    // Find the comment
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user is the one who created the comment
    if (comment.user_id !== userId) {
      throw new ForbiddenException('You are not authorized to delete this comment');
    }

    // Delete the comment
    await this.prisma.postComment.delete({
      where: { id: commentId },
    });
  }


  async likePost(userId: number, postId: number): Promise<PostLike> {
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
  
    if (post.user.account_type === 'PRIVATE') {
      const isFollowing = await this.prisma.follow.findFirst({
        where: {
          follower_id: userId,
          followed_id: post.user.id,
        },
      });
  
      if (!isFollowing) {
        throw new ForbiddenException('Cannot like private post');
      }
    }
  
    return this.prisma.postLike.create({
      data: {
        user_id: userId,
        post_id: postId,
      },
    });
  }
  

  async unlikePost(userId: number, postId: number): Promise<void> {
    const like = await this.prisma.postLike.findFirst({
      where: {
        user_id: userId,
        post_id: postId
      }
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.postLike.delete({
      where: { id: like.id }
    });
  }

  async sharePost(userId: number, postId: number): Promise<SharedPost> {
    // Check if post exists
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { user: true }
    });
  
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  
    // Check if already shared
    const existingShare = await this.prisma.sharedPost.findFirst({
      where: {
        user_id: userId,
        post_id: postId
      }
    });
  
    if (existingShare) {
      throw new BadRequestException('Post already shared');
    }
  
    // Check if post is private and user doesn't follow the author
    if (post.user.account_type === 'PRIVATE') {
      const isFollowing = await this.prisma.follow.findFirst({
        where: {
          follower_id: userId,
          followed_id: post.user.id
        }
      });
  
      if (!isFollowing) {
        throw new ForbiddenException('Cannot share private post');
      }
    }
  
    // Share the post
    const sharedPost = await this.prisma.sharedPost.create({
      data: {
        user_id: userId,
        post_id: postId
      }
    });
  
    return sharedPost;
  }
  
  async savePost(userId: number, postId: number): Promise<SavedPost> {
    // Check if post exists
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { user: true }
    });
  
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  
    // Check if already shared
    const existingSave = await this.prisma.savedPost.findFirst({
      where: {
        user_id: userId,
        post_id: postId
      }
    });
  
    if (existingSave) {
      throw new BadRequestException('Post already saved');
    }
  
    // Check if post is private and user doesn't follow the author
    if (post.user.account_type === 'PRIVATE') {
      const isFollowing = await this.prisma.follow.findFirst({
        where: {
          follower_id: userId,
          followed_id: post.user.id
        }
      });
  
      if (!isFollowing) {
        throw new ForbiddenException('Cannot save private post');
      }
    }
  
    // Share the post
    const savedPost = await this.prisma.savedPost.create({
      data: {
        user_id: userId,
        post_id: postId
      }
    });
  
    return savedPost;
  }

  async unsharePost(userId: number, postId: number): Promise<void> {
    const share = await this.prisma.sharedPost.findFirst({
      where: {
        user_id: userId,
        post_id: postId
      }
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    await this.prisma.sharedPost.delete({
      where: { id: share.id }
    });
  }
  async unsavePost(userId: number, postId: number): Promise<void> {
    const share = await this.prisma.sharedPost.findFirst({
      where: {
        user_id: userId,
        post_id: postId
      }
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    await this.prisma.savedPost.delete({
      where: { id: share.id }
    });
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    return this.prisma.postComment.findMany({
      where: { post_id: postId },
      include: { user: true },
      orderBy: { created_at: 'desc' }
    });
  }

  async getPostLikes(postId: number): Promise<PostLike[]> {
    return this.prisma.postLike.findMany({
      where: { post_id: postId },
      include: { user: true }
    });
  }

  async getPostShares(postId: number): Promise<SharedPost[]> {
    return this.prisma.sharedPost.findMany({
      where: { post_id: postId },
      include: { user: true }
    });
  }
}
