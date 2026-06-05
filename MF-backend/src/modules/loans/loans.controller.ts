import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Req, Query, Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { CreateLoanTransactionDto } from './dto/create-loan-transaction.dto';
import { PreCloseLoanDto } from './dto/pre-close-loan.dto';
import { ReverseLoanTransactionDto } from './dto/reverse-loan-transaction.dto';
import { UpdateLoanTransactionDto } from './dto/update-loan-transaction.dto';
import { RenewBulletLoanDto } from './dto/renew-bullet-loan.dto';
import { ApplyBulletPenaltyDto } from './dto/apply-bullet-penalty.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { LoanStatus } from '../../common/enums/loan-status.enum';
import { IdempotencyService } from '../idempotency/idempotency.service';

function normalizeLoanStatus(status?: string): LoanStatus | undefined {
  if (!status) return undefined;

  const normalized = status.trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (normalized === LoanStatus.ACTIVE) return LoanStatus.ACTIVE;
  if (normalized === LoanStatus.CLOSED) return LoanStatus.CLOSED;
  if (normalized === LoanStatus.PRE_CLOSED) return LoanStatus.PRE_CLOSED;

  return undefined;
}

@Controller('loans')
@UseGuards(JwtAuthGuard, CentreIsolationGuard)
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly idempotency: IdempotencyService,
  ) {}

  // ─── Create & Update Loan ──────────────────────────────────────────────────
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@CurrentUser() user: any, @Body() dto: CreateLoanDto, @Req() req: Request) {
    return this.loansService.create(user.centreId, user.sub, dto, req.ip, req.headers['user-agent']);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateLoanDto, @Req() req: Request) {
    return this.loansService.updateLoan(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']);
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  /** GET /loans/dashboard — centre-level stats */
  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getDashboard(@CurrentUser() user: any) {
    return this.loansService.getDashboard(user.centreId);
  }

  // ─── Agent Collection Report ──────────────────────────────────────────────
  /** GET /loans/report/collections?from=&to=&agentId= */
  @Get('report/collections')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getCollectionReport(
    @CurrentUser() user: any,
    @Query('from')     from?    : string,
    @Query('to')       to?      : string,
    @Query('agentId')  agentId? : string,
  ) {
    // M-5: Agents can only see their own collections, never the full centre report
    const effectiveAgentId = user.role === Role.AGENT ? user.sub : agentId;
    return this.loansService.getCollectionReport(user.centreId, { from, to, agentId: effectiveAgentId });
  }

  // ─── Customer Summary ─────────────────────────────────────────────────────
  /** GET /loans/customers/:customerId/summary */
  @Get('customers/:customerId/summary')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT, Role.CUSTOMER)
  getCustomerSummary(@CurrentUser() user: any, @Param('customerId') customerId: string) {
    return this.loansService.getCustomerSummary(user.centreId, customerId, user);
  }

  // ─── List Loans (with filters) ────────────────────────────────────────────
  /**
   * GET /loans
   * Query params: status, from, to, search, customerId, agentId, overdue
   *
   * Examples:
   *   GET /loans?status=active
   *   GET /loans?overdue=true
   *   GET /loans?from=2026-01-01&to=2026-04-30
   *   GET /loans?search=LOAN-C1-00001
   *   GET /loans?customerId=<uuid>
   *   GET /loans?agentId=<uuid>
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT, Role.CUSTOMER)
  findAll(
    @CurrentUser() user: any,
    @Query('status')     status?     : string,
    @Query('from')       from?       : string,
    @Query('to')         to?         : string,
    @Query('search')     search?     : string,
    @Query('customerId') customerId? : string,
    @Query('agentId')    agentId?    : string,
    @Query('overdue')    overdue?    : string,
  ) {
    return this.loansService.findAll(user.centreId, user, {
      status: normalizeLoanStatus(status),
      from, to, search, customerId, agentId,
      overdue: overdue === 'true',
    });
  }

  // ─── Single Loan ──────────────────────────────────────────────────────────
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.loansService.findOne(user.centreId, id, user);
  }

  // ─── Repayment Schedule ───────────────────────────────────────────────────
  /** GET /loans/:id/schedule — full amortization table */
  @Get(':id/schedule')
  getSchedule(@CurrentUser() user: any, @Param('id') loanId: string) {
    return this.loansService.getSchedule(user.centreId, loanId, user);
  }

  // ─── Transactions ─────────────────────────────────────────────────────────
  /**
   * POST /loans/:id/transactions
   *
   * Idempotency-Key header (optional):
   *   Supply a unique UUID per request. If the same key is sent again within
   *   24 hours, the original response is returned and no duplicate transaction
   *   is created. Useful to safely retry on network failures.
   */
  @Post(':id/transactions')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  addTransaction(
    @CurrentUser() user: any,
    @Param('id') loanId: string,
    @Body() dto: CreateLoanTransactionDto,
    @Req() req: Request,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.idempotency.wrap(
      idempotencyKey,
      user.sub,
      user.centreId,
      'loan-transaction',
      () => this.loansService.addTransaction(
        user.centreId, loanId, user.sub, dto, user.role, req.ip, req.headers['user-agent'],
      ),
    );
  }

  @Get(':id/transactions')
  getTransactions(@CurrentUser() user: any, @Param('id') loanId: string) {
    return this.loansService.getTransactions(user.centreId, loanId, user);
  }

  // ─── Pre-close & Reverse ──────────────────────────────────────────────────
  @Post(':id/pre-close')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  preClose(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: PreCloseLoanDto,
    @Req() req: Request,
  ) {
    return this.loansService.preClose(user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent']);
  }

  @Post(':id/renew-bullet')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  renewBulletLoan(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RenewBulletLoanDto,
    @Req() req: Request,
  ) {
    return this.loansService.renewBulletLoan(
      user.centreId, id, user.sub, dto, user.role, req.ip, req.headers['user-agent'],
    );
  }

  @Post(':id/apply-bullet-penalty')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  applyBulletPenalty(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ApplyBulletPenaltyDto,
    @Req() req: Request,
  ) {
    return this.loansService.applyBulletPenalty(
      user.centreId, id, user.sub, dto, req.ip, req.headers['user-agent'],
    );
  }

  @Patch(':id/transactions/:txId/reverse')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  reverse(
    @CurrentUser() user: any,
    @Param('id') loanId: string,
    @Param('txId') txId: string,
    @Body() dto: ReverseLoanTransactionDto,
    @Req() req: Request,
  ) {
    return this.loansService.reverseTransaction(
      user.centreId, loanId, txId, user.sub, dto, req.ip, req.headers['user-agent'],
    );
  }

  // ─── Edit & Delete Transactions ───────────────────────────────────────────
  /**
   * PATCH /loans/:id/transactions/:txId
   * Edit amount, paymentDate, paymentMode, or notes of a loan transaction.
   * Loan totalPaid / remainingBalance are fully recalculated afterwards.
   * Only ADMIN can edit transactions.
   */
  @Patch(':id/transactions/:txId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateTransaction(
    @CurrentUser() user: any,
    @Param('id') loanId: string,
    @Param('txId') txId: string,
    @Body() dto: UpdateLoanTransactionDto,
    @Req() req: Request,
  ) {
    return this.loansService.updateLoanTransaction(
      user.centreId, loanId, txId, user.sub, dto, req.ip, req.headers['user-agent'],
    );
  }

  /**
   * DELETE /loans/:id/transactions/:txId
   * Permanently remove a loan transaction.
   * Loan totalPaid / remainingBalance are recalculated. If a linked diary
   * deduction existed, the diary balance is automatically refunded.
   * Only ADMIN can delete transactions.
   */
  @Delete(':id/transactions/:txId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteTransaction(
    @CurrentUser() user: any,
    @Param('id') loanId: string,
    @Param('txId') txId: string,
    @Req() req: Request,
  ) {
    return this.loansService.deleteLoanTransaction(
      user.centreId, loanId, txId, user.sub, req.ip, req.headers['user-agent'],
    );
  }
  /**
   * DELETE /loans/:id
   * Permanently delete a loan and its transactions. Refunds diary entries if applicable.
   * Only ADMIN can delete loans.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteLoan(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.loansService.deleteLoan(
      user.centreId, id, user.sub, req.ip, req.headers['user-agent'],
    );
  }
}
