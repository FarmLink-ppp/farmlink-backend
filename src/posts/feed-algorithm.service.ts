import { Injectable } from '@nestjs/common';
import { ForumPost, User } from '@prisma/client';

@Injectable()
export class FeedAlgorithmService {
  private readonly weights = {
    likeWeight: 0.4,
    commentWeight: 0.5,
    shareWeight: 0.6, // Added share weight
    friendWeight: 0.8,
    timeRelevanceWeight: 0.3,
    baseScore: 1.0
  };

  private readonly halfLife = 24; // hours

  calculatePostScore(
    post: ForumPost & { likes: any[], comments: any[], shares: any[] }, 
    viewerId: number, 
    isFollowingAuthor: boolean
  ): number {
    // Calculate freshness
    const hoursSincePost = (Date.now() - post.created_at.getTime()) / (1000 * 60 * 60);
    const freshnessScore = Math.pow(2, -hoursSincePost / this.halfLife);

    // Calculate engagement (now including shares)
    const likeScore = this.normalizeCount(post.likes.length) * this.weights.likeWeight;
    const commentScore = this.normalizeCount(post.comments.length) * this.weights.commentWeight;
    const shareScore = this.normalizeCount(post.shares.length) * this.weights.shareWeight;
    const engagementScore = likeScore + commentScore + shareScore;

    // Calculate relationship score
    const relationshipScore = isFollowingAuthor ? this.weights.friendWeight : 0;

    // Combine all factors
    return this.weights.baseScore + 
           (engagementScore + relationshipScore) * freshnessScore;
  }

  private normalizeCount(count: number): number {
    return Math.log1p(count);
  }

  getRankedFeed(
    posts: (ForumPost & { likes: any[], comments: any[], shares: any[] })[],
    viewerId: number,
    followingMap: Record<number, boolean>
  ): ForumPost[] {
    const scoredPosts = posts.map(post => ({
      post,
      score: this.calculatePostScore(post, viewerId, followingMap[post.user_id] || false)
    }));
    
    scoredPosts.sort((a, b) => b.score - a.score);
    
    return scoredPosts.map(item => item.post);
  }
}