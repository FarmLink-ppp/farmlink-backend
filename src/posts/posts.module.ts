import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { FeedAlgorithmService } from './feed-algorithm.service';
@Module({
  controllers: [PostsController],
  providers: [PostsService, FeedAlgorithmService],
})
export class PostsModule {}
