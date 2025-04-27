import { Get } from '@nestjs/common';
import { DailyTipService } from './daily-tip.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';

@Auth()
@ApiController('daily-tip')
export class DailyTipController {
  constructor(private readonly dailyTipService: DailyTipService) {}

  @Get()
  getDailyTip() {
    return this.dailyTipService.getDailyTip();
  }
}
