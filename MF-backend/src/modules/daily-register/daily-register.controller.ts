import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DailyRegisterService } from './daily-register.service';
import { CreateRegisterDayDto } from './dto/create-register-day.dto';
import { CreateRegisterEntryDto } from './dto/create-register-entry.dto';
import { UpdateRegisterEntryDto } from './dto/update-register-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('daily-register')
@UseGuards(JwtAuthGuard, CentreIsolationGuard, RolesGuard)
@Roles(Role.ADMIN, Role.KIOSK)
export class DailyRegisterController {
  constructor(private readonly service: DailyRegisterService) {}

  @Post('days')
  openDay(@CurrentUser() user: any, @Body() dto: CreateRegisterDayDto) {
    return this.service.openDay(user.centreId, user.sub, dto);
  }

  @Get('days')
  findDays(@CurrentUser() user: any) {
    return this.service.findDays(user.centreId);
  }

  @Get('days/:dayId/entries')
  findEntries(@CurrentUser() user: any, @Param('dayId') dayId: string) {
    return this.service.findEntries(user.centreId, dayId);
  }

  @Post('days/:dayId/entries')
  addEntry(@CurrentUser() user: any, @Param('dayId') dayId: string, @Body() dto: CreateRegisterEntryDto) {
    return this.service.addEntry(user.centreId, dayId, user.sub, dto);
  }

  @Patch('entries/:id')
  updateEntry(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateRegisterEntryDto) {
    return this.service.updateEntry(user.centreId, id, user.sub, dto);
  }

  @Delete('entries/:id')
  deleteEntry(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.deleteEntry(user.centreId, id);
  }
}
