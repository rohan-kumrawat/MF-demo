import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard, CentreIsolationGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ─── Agent Collections ────────────────────────────────────────────────────
  /**
   * GET /reports/collections
   *
   * Query params:
   *   period   : day | week | month   (default: day — i.e. today)
   *   from     : YYYY-MM-DD           (custom range start — use with `to`)
   *   to       : YYYY-MM-DD           (custom range end)
   *   agentId  : uuid                 (optional — filter by specific agent)
   *
   * Examples:
   *   GET /reports/collections                             → today, all agents
   *   GET /reports/collections?period=week                → this week, all agents
   *   GET /reports/collections?period=month               → this month, all agents
   *   GET /reports/collections?from=2026-04-01&to=2026-04-30  → custom range
   *   GET /reports/collections?period=day&agentId=<uuid>  → today, specific agent
   */
  @Get('collections')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getCollections(
    @CurrentUser() user: any,
    @Query('period')  period?  : string,
    @Query('from')    from?    : string,
    @Query('to')      to?      : string,
    @Query('agentId') agentId? : string,
  ) {
    return this.reportsService.agentCollections(user.centreId, { agentId: agentId, period, from, to });
  }

  // ─── Day-wise Breakdown for a specific agent ──────────────────────────────
  /**
   * GET /reports/collections/agent/:agentId/day-wise
   *
   * Query params:
   *   days : number of past days to show (default: 30)
   *   from : YYYY-MM-DD  (custom range — use with `to`)
   *   to   : YYYY-MM-DD
   *
   * Examples:
   *   GET /reports/collections/agent/:id/day-wise          → last 30 days
   *   GET /reports/collections/agent/:id/day-wise?days=7   → last 7 days
   *   GET /reports/collections/agent/:id/day-wise?from=2026-04-01&to=2026-04-30
   */
  @Get('collections/agent/:agentId/day-wise')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getAgentDayWise(
    @CurrentUser() user: any,
    @Param('agentId') agentId: string,
    @Query('days') days?  : string,
    @Query('from') from?  : string,
    @Query('to')   to?    : string,
  ) {
    return this.reportsService.agentDayWise(user.centreId, agentId, {
      days: days ? parseInt(days, 10) : undefined,
      from,
      to,
    });
  }

  // ─── Centre Summary (all agents, for ADMIN) ───────────────────────────────
  /**
   * GET /reports/summary
   *
   * Query params: period | from + to  (same as /collections)
   *
   * Returns leaderboard: all agents sorted by amount collected in the period.
   */
  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getCentreSummary(
    @CurrentUser() user: any,
    @Query('period') period? : string,
    @Query('from')   from?   : string,
    @Query('to')     to?     : string,
  ) {
    return this.reportsService.centreSummary(user.centreId, { period, from, to });
  }

  // ─── Combined Transactions (Loan + Diary) ─────────────────────────────────
  /**
   * GET /reports/transactions
   *
   * Query params (all optional, all combinable):
   *   source      : "loan" | "diary"   (default: both)
   *   agentId     : UUID               (loan transactions by this agent only)
   *   customerId  : UUID               (transactions for this customer)
   *   loanId      : UUID               (transactions for this specific loan)
   *   diaryId     : UUID               (transactions for this specific diary account)
   *   from        : YYYY-MM-DD
   *   to          : YYYY-MM-DD
   *   page        : number (default: 1)
   *   limit       : number (default: 50, max: 200)
   *
   * Examples:
   *   GET /reports/transactions                                         → all, page 1
   *   GET /reports/transactions?source=loan&agentId=<uuid>             → agent's loan txns
   *   GET /reports/transactions?source=diary&customerId=<uuid>         → customer's diary txns
   *   GET /reports/transactions?from=2026-05-01&to=2026-05-31          → May 2026, both
   *   GET /reports/transactions?source=loan&agentId=<uuid>&from=2026-05-01&to=2026-05-31
   */
  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getCombinedTransactions(
    @CurrentUser() user: any,
    @Query('source')     source?     : string,
    @Query('agentId')    agentId?    : string,
    @Query('customerId') customerId? : string,
    @Query('loanId')     loanId?     : string,
    @Query('diaryId')    diaryId?    : string,
    @Query('from')       from?       : string,
    @Query('to')         to?         : string,
    @Query('page')       page?       : string,
    @Query('limit')      limit?      : string,
  ) {
    return this.reportsService.combinedTransactions(user.centreId, {
      source     : source as 'loan' | 'diary' | undefined,
      agentId    : agentId,
      customerId,
      loanId,
      diaryId,
      from,
      to,
      page       : page  ? parseInt(page,  10) : undefined,
      limit      : limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('transactions/:txId/receipt')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  getTransactionReceipt(
    @CurrentUser() user: any,
    @Param('txId') txId: string,
    @Query('source') source: 'loan' | 'diary',
  ) {
    return this.reportsService.getTransactionReceipt(user.centreId, txId, source);
  }
}
