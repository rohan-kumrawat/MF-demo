import { Controller, Get, UseGuards } from '@nestjs/common';
import { CentresService } from './centres.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';

@Controller('centres')
@UseGuards(JwtAuthGuard, CentreIsolationGuard)
export class CentresController {
  constructor(private readonly centresService: CentresService) {}

  @Get()
  findAll() {
    return this.centresService.findAll();
  }
}
