import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Headers, Query, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { DiaryService } from './diary.service';
import { CreateDiaryAccountDto } from './dto/create-diary-account.dto';
import { DiaryDepositDto } from './dto/diary-deposit.dto';
import { DiaryWithdrawDto } from './dto/diary-withdraw.dto';
import { DiaryInterestDto } from './dto/diary-interest.dto';
import { UpdateDiaryTransactionDto } from './dto/update-diary-transaction.dto';
import { UpdateDiaryAccountDto } from './dto/update-diary-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { IdempotencyService } from '../idempotency/idempotency.service';

@Controller('diary')
@UseGuards(JwtAuthGuard, CentreIsolationGuard)
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly idempotency: IdempotencyService,
  ) {}

  @Post('accounts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  createAccount(@CurrentUser() user: any, @Body() dto: CreateDiaryAccountDto) {
    return this.diaryService.createAccount(user.centreId, user.sub, dto);
  }

  @Get('accounts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.AGENT)
  findAccounts(@CurrentUser() user: any) {
    return this.diaryService.findAccounts(user.centreId);
  }

  @Get('customers/:customerId/accounts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.AGENT)
  findAccountsByCustomer(@CurrentUser() user: any, @Param('customerId') customerId: string) {
    if (user.role === Role.CUSTOMER && user.sub !== customerId) {
      throw new ForbiddenException('You can only view your own diary accounts');
    }
    return this.diaryService.findAccountsByCustomer(user.centreId, customerId);
  }

  @Get('accounts/search')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  searchAccounts(
    @CurrentUser() user: any,
    @Query('q') search?: string,
  ) {
    return this.diaryService.searchAccounts(user.centreId, search);
  }

  @Get('accounts/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.AGENT)
  findAccount(@CurrentUser() user: any, @Param('id') id: string) {
    return this.diaryService.findAccount(user, id);
  }

  @Patch('accounts/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateAccount(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateDiaryAccountDto,
    @Req() req: Request
  ) {
    return this.diaryService.updateAccount(user, id, dto, req.ip, req.headers['user-agent']);
  }

  /**
   * DELETE /diary/accounts/:id
   * Soft delete a diary account. Historical transactions remain for audit.
   */
  @Delete('accounts/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteAccount(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.diaryService.deleteAccount(user.centreId, id, user.sub, req.ip, req.headers['user-agent']);
  }

  @Get('accounts/:id/transactions')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER, Role.AGENT)
  getTransactions(@CurrentUser() user: any, @Param('id') id: string) {
    return this.diaryService.getTransactions(user, id);
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  summary(
    @CurrentUser() user: any,
    @Query('date') date?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.diaryService.getSummary(user.centreId, date, from, to);
  }

  /**
   * POST /diary/accounts/:id/deposit
   *
   * Idempotency-Key header (optional):
   *   Supply a unique UUID per request. If the same key is sent again within
   *   24 hours, the original response is returned and no duplicate deposit
   *   is created. Useful to safely retry on network failures.
   */
  @Post('accounts/:id/deposit')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  deposit(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: DiaryDepositDto,
    @Req() req: Request,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.idempotency.wrap(
      idempotencyKey,
      user.sub,
      user.centreId,
      'diary-deposit',
      () => this.diaryService.deposit(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']),
    );
  }

  /**
   * POST /diary/accounts/:id/withdraw
   *
   * Idempotency-Key header (optional):
   *   Supply a unique UUID per request. If the same key is sent again within
   *   24 hours, the original response is returned and no duplicate withdrawal
   *   is created.
   */
  @Post('accounts/:id/withdraw')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  withdraw(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: DiaryWithdrawDto,
    @Req() req: Request,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.idempotency.wrap(
      idempotencyKey,
      user.sub,
      user.centreId,
      'diary-withdraw',
      () => this.diaryService.withdraw(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']),
    );
  }

  /**
   * POST /diary/accounts/:id/interest
   *
   * Idempotency-Key header (optional):
   *   Supply a unique UUID per request. If the same key is sent again within
   *   24 hours, the original response is returned and no duplicate interest
   *   credit is created.
   */
  @Post('accounts/:id/interest')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  addInterest(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: DiaryInterestDto,
    @Req() req: Request,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.idempotency.wrap(
      idempotencyKey,
      user.sub,
      user.centreId,
      'diary-interest',
      () => this.diaryService.addInterest(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']),
    );
  }

  // ─── Edit & Delete Transactions ───────────────────────────────────────────
  /**
   * PATCH /diary/accounts/:id/transactions/:txId
   * Edit amount, date, or notes of a diary transaction.
   * Balances of all subsequent transactions are recalculated automatically.
   */
  @Patch('accounts/:id/transactions/:txId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateTransaction(
    @CurrentUser() user: any,
    @Param('id') accountId: string,
    @Param('txId') txId: string,
    @Body() dto: UpdateDiaryTransactionDto,
    @Req() req: Request,
  ) {
    return this.diaryService.updateTransaction(
      user.centreId, accountId, txId, user.sub, dto, req.ip, req.headers['user-agent'],
    );
  }

  /**
   * DELETE /diary/accounts/:id/transactions/:txId
   * Permanently remove a diary transaction.
   * Account balance and all subsequent snapshots are recalculated.
   */
  @Delete('accounts/:id/transactions/:txId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteTransaction(
    @CurrentUser() user: any,
    @Param('id') accountId: string,
    @Param('txId') txId: string,
    @Req() req: Request,
  ) {
    return this.diaryService.deleteTransaction(
      user.centreId, accountId, txId, user.sub, req.ip, req.headers['user-agent'],
    );
  }
}
