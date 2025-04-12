import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FeedAlgorithmService } from './feed-algorithm.service';
@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, FeedAlgorithmService],
})
export class PostsModule {}
