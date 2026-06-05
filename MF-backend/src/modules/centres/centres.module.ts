import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentresController } from './centres.controller';
import { CentresService } from './centres.service';
import { Centre } from './entities/centre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Centre])],
  controllers: [CentresController],
  providers: [CentresService],
  exports: [CentresService],
})
export class CentresModule {}
