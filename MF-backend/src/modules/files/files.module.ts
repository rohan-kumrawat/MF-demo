import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryService } from './cloudinary.service';
import { CustomerFile } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerFile])],
  controllers: [FilesController],
  providers: [FilesService, CloudinaryService],
  exports: [FilesService, CloudinaryService],
})
export class FilesModule {}
