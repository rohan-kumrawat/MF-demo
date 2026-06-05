import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentreSequence } from './entities/centre-sequence.entity';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CentreSequence])],
  controllers: [SequencesController],
  providers: [SequencesService],
  exports: [SequencesService],
})
export class SequencesModule {}
