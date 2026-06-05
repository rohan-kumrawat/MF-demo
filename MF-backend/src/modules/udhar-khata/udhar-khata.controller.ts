import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req, Query
} from '@nestjs/common';
import { Request } from 'express';
import { UdharKhataService } from './udhar-khata.service';
import { CreateUdharPersonDto } from './dto/create-udhar-person.dto';
import { CreateUdharEntryDto } from './dto/create-udhar-entry.dto';
import { UpdateUdharEntryDto } from './dto/update-udhar-entry.dto';
import { UpdateUdharPersonDto } from './dto/update-udhar-person.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('udhar-khata')
@UseGuards(JwtAuthGuard, CentreIsolationGuard, RolesGuard)
@Roles(Role.ADMIN, Role.KIOSK)
export class UdharKhataController {
  constructor(private readonly service: UdharKhataService) {}

  @Post('persons')
  createPerson(@CurrentUser() user: any, @Body() dto: CreateUdharPersonDto) {
    return this.service.createPerson(user.centreId, user.sub, dto);
  }

  @Get('persons')
  findPersons(@CurrentUser() user: any) {
    return this.service.findPersons(user.centreId);
  }

  @Get('persons/search')
  searchPersons(
    @CurrentUser() user: any,
    @Query('q') search?: string,
  ) {
    return this.service.searchPersons(user.centreId, search);
  }

  @Patch('persons/:id')
  @Roles(Role.ADMIN)
  updatePerson(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUdharPersonDto, @Req() req: Request) {
    return this.service.updatePerson(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']);
  }

  @Get('persons/:id/entries')
  findEntries(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.findEntries(user.centreId, id);
  }

  @Post('persons/:id/entries')
  addEntry(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateUdharEntryDto, @Req() req: Request) {
    return this.service.addEntry(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']);
  }

  @Patch('entries/:id')
  updateEntry(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUdharEntryDto, @Req() req: Request) {
    return this.service.updateEntry(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']);
  }

  @Delete('persons/:id')
  @Roles(Role.ADMIN)
  deletePerson(@CurrentUser() user: any, @Param('id') id: string, @Req() req: Request) {
    return this.service.deletePerson(user.centreId, id, user.sub, req.ip, req.headers['user-agent']);
  }

  @Delete('entries/:id')
  deleteEntry(@CurrentUser() user: any, @Param('id') id: string, @Req() req: Request) {
    return this.service.deleteEntry(user.centreId, id, user.sub, req.ip, req.headers['user-agent']);
  }
}
