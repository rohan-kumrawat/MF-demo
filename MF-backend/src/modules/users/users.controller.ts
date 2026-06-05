import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, CentreIsolationGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    const result = this.usersService.create(user.centreId, dto);
    return result.then(u => UserResponseDto.from(u));
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  findAll(
    @CurrentUser() user: any,
    @Query('role')  role?  : Role,
    @Query('name')  name?  : string,
    @Query('status') status?: string,
    @Query('risk') risk?: string,
    @Query('agent') agent?: string,
    @Query('page')  page?  : string,
    @Query('limit') limit? : string,
  ) {
    return this.usersService.findAll(
      user.centreId,
      role,
      name,
      status,
      risk,
      agent,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('customers/search')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  searchCustomers(
    @CurrentUser() user: any,
    @Query('q') search?: string,
  ) {
    return this.usersService.searchCustomers(user.centreId, search);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    // Admins can view any user in centre; others can only view themselves
    if (user.role !== Role.ADMIN && user.sub !== id)
      throw new ForbiddenException('You can only view your own profile');
    const result = this.usersService.findOne(user.centreId, id);
    return result.then(u => UserResponseDto.from(u));
  }

  @Patch(':id/password')
  changePassword(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: ChangePasswordDto) {
    // Only the user themselves can change their own password this way (or maybe admin can bypass? Better to keep it strict)
    if (user.role !== Role.ADMIN && user.sub !== id)
      throw new ForbiddenException('You can only change your own password');
    return this.usersService.changePassword(user.centreId, id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    // Non-admins can only update their own profile
    if (user.role !== Role.ADMIN && user.sub !== id)
      throw new ForbiddenException('You can only update your own profile');
    // Pass caller's role so the service can guard isActive
    const result = this.usersService.update(user.centreId, id, dto, user.role);
    return result.then(u => UserResponseDto.from(u));
  }

  @Post(':id/email/request-otp')
  requestEmailOtp(@CurrentUser() user: any, @Param('id') id: string, @Body('newEmail') newEmail: string) {
    if (user.role !== Role.ADMIN && user.sub !== id)
      throw new ForbiddenException('You can only update your own email');
    return this.usersService.requestEmailOtp(user.centreId, id, newEmail);
  }

  @Post(':id/email/verify-otp')
  verifyEmailOtp(@CurrentUser() user: any, @Param('id') id: string, @Body('otp') otp: string) {
    if (user.role !== Role.ADMIN && user.sub !== id)
      throw new ForbiddenException('You can only update your own email');
    return this.usersService.verifyEmailOtp(user.centreId, id, otp);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.hardDelete(user.centreId, id);
  }
}
