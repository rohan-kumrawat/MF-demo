import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyRegisterController } from './daily-register.controller';
import { DailyRegisterService } from './daily-register.service';
import { DailyRegisterDay } from './entities/daily-register-day.entity';
import { DailyRegisterEntry } from './entities/daily-register-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyRegisterDay, DailyRegisterEntry])],
  controllers: [DailyRegisterController],
  providers: [DailyRegisterService],
})
export class DailyRegisterModule {}
