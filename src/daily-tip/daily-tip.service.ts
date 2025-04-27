import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DailyTipService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyTip() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
    );

    const totalTips = await this.prisma.dailyTip.count();

    const tipIndex = dayOfYear % totalTips;

    const tip = await this.prisma.dailyTip.findFirst({
      skip: tipIndex,
      take: 1,
      orderBy: {
        id: 'asc',
      },
    });

    return tip;
  }
}
