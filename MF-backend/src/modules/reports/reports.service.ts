import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parse, parseISO, isValid } from 'date-fns';
import { round2, toNumber } from '../../common/utils/math.util';

@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private normalizeDateParam(value?: string): string | undefined {
    if (!value) return undefined;

    const trimmed = value.trim();
    const candidates = [
      parseISO(trimmed),
      parse(trimmed, 'yyyy-MM-dd', new Date()),
      parse(trimmed, 'dd/MM/yyyy', new Date()),
    ];

    const validDate = candidates.find((candidate) => isValid(candidate));
    if (!validDate) return undefined;

    return format(validDate, 'yyyy-MM-dd');
  }

  // ─── Resolve date range from period ─────────────────────────────────────────
  private resolvePeriod(period?: string, from?: string, to?: string): { fromDate: string; toDate: string; label: string } {
    const today = new Date();
    const normalizedFrom = this.normalizeDateParam(from);
    const normalizedTo = this.normalizeDateParam(to);

    if (normalizedFrom && normalizedTo) {
      return { fromDate: normalizedFrom, toDate: normalizedTo, label: `${normalizedFrom} to ${normalizedTo}` };
    }

    // S-9: Explicit validation — unknown values now throw 400 instead of silently defaulting to today
    const VALID_PERIODS = ['day', 'week', 'month'] as const;
    if (period && !from && !to && !(VALID_PERIODS as readonly string[]).includes(period)) {
      throw new Error(`Invalid period '${period}'. Must be one of: day, week, month`);
    }

    switch (period) {
      case 'week': {
        const s = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const e = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        return { fromDate: s, toDate: e, label: 'This Week' };
      }
      case 'month': {
        const s = format(startOfMonth(today), 'yyyy-MM-dd');
        const e = format(endOfMonth(today), 'yyyy-MM-dd');
        return { fromDate: s, toDate: e, label: 'This Month' };
      }
      default: {
        // day (or no period specified)
        const d = format(today, 'yyyy-MM-dd');
        return { fromDate: d, toDate: d, label: 'Today' };
      }
    }
  }

  // ─── Agent Collection Report ──────────────────────────────────────────────
  /**
   * Returns collection summary for one or all agents in a centre,
   * for a given period (day / week / month / custom range).
   *
   * Aggregates loan_transactions (EMI, FULL_PAYMENT, PENALTY, OTHER).
   */
  async agentCollections(
    centreId: string,
    opts: { agentId?: string; period?: string; from?: string; to?: string },
  ) {
    const { fromDate, toDate, label } = this.resolvePeriod(opts.period, opts.from, opts.to);

    // ── LOAN TRANSACTIONS ───────────────────────────────────────────────────
    let txQuery = `
      SELECT
        lt.id,
        lt."loanId",
        lt."collectedBy"  AS "agentId",
        lt.type,
        lt.amount::numeric,
        lt."principalPart"::numeric,
        lt."interestPart"::numeric,
        lt."penaltyPart"::numeric,
        lt."paymentDate",
        lt."receiptNo",
        lt."paymentMode",
        l."loanAccountNumber",
        u.name            AS "agentName"
      FROM loan_transactions lt
      JOIN loans         l ON l.id = lt."loanId"
      JOIN users         u ON u.id = lt."collectedBy"
      WHERE lt."centreId" = $1
        AND lt."isReversed" = false
        AND lt."paymentDate" BETWEEN $2 AND $3
    `;
    const params: any[] = [centreId, fromDate, toDate];

    if (opts.agentId) {
      params.push(opts.agentId);
      txQuery += ` AND lt."collectedBy" = $${params.length}`;
    }

    txQuery += ` ORDER BY lt."paymentDate" DESC, lt."createdAt" DESC`;

    const rows: any[] = await this.dataSource.query(txQuery, params);

    // ── DIARY DEPOSIT TRANSACTIONS ──────────────────────────────────────────
    let diaryQuery = `
      SELECT
        dt.id,
        dt."performedBy"            AS "agentId",
        dt.type,
        dt.amount::numeric,
        dt."transactionDate"::text  AS "paymentDate",
        dt."receiptNo",
        da."accountCode"            AS "diaryAccountCode",
        u.name                      AS "agentName"
      FROM diary_transactions dt
      JOIN diary_accounts da ON da.id = dt."accountId" AND da."deletedAt" IS NULL
      JOIN users          u  ON u.id  = dt."performedBy"
      WHERE dt."centreId"    = $1
        AND dt."isReversed"  = false
        AND dt.type          = 'deposit'
        AND dt."transactionDate" BETWEEN $2 AND $3
    `;
    const diaryParams: any[] = [centreId, fromDate, toDate];

    if (opts.agentId) {
      diaryParams.push(opts.agentId);
      diaryQuery += ` AND dt."performedBy" = $${diaryParams.length}`;
    }

    diaryQuery += ` ORDER BY dt."transactionDate" DESC, dt."createdAt" DESC`;

    const diaryRows: any[] = await this.dataSource.query(diaryQuery, diaryParams);

    // ── Aggregate by agent ─────────────────────────────────────────────────
    const agentMap = new Map<string, {
      agentId: string;
      agentName: string;
      totalCollected: number;
      emiCount: number;
      penaltyCount: number;
      otherCount: number;
      diaryDepositCount: number;
      diaryDepositTotal: number;
      principalCollected: number;
      interestCollected: number;
      penaltyCollected: number;
      transactions: any[];
    }>();

    const ensureAgent = (agentId: string, agentName: string) => {
      if (!agentMap.has(agentId)) {
        agentMap.set(agentId, {
          agentId,
          agentName,
          totalCollected: 0,
          emiCount: 0,
          penaltyCount: 0,
          otherCount: 0,
          diaryDepositCount: 0,
          diaryDepositTotal: 0,
          principalCollected: 0,
          interestCollected: 0,
          penaltyCollected: 0,
          transactions: [],
        });
      }
      return agentMap.get(agentId)!;
    };

    for (const row of rows) {
      const a = ensureAgent(row.agentId, row.agentName);
      const amt = round2(toNumber(row.amount));
      a.totalCollected     = round2(a.totalCollected + amt);
      a.principalCollected = round2(a.principalCollected + toNumber(row.principalPart));
      a.interestCollected  = round2(a.interestCollected  + toNumber(row.interestPart));
      a.penaltyCollected   = round2(a.penaltyCollected   + toNumber(row.penaltyPart));

      if (['emi', 'full_payment'].includes(row.type))   a.emiCount++;
      else if (row.type === 'penalty')                  a.penaltyCount++;
      else                                              a.otherCount++;

      a.transactions.push({
        id               : row.id,
        source           : 'loan',
        loanId           : row.loanId,
        loanAccountNumber: row.loanAccountNumber,
        type             : row.type,
        amount           : amt,
        principalPart    : round2(toNumber(row.principalPart)),
        interestPart     : round2(toNumber(row.interestPart)),
        penaltyPart      : round2(toNumber(row.penaltyPart)),
        paymentDate      : row.paymentDate,
        receiptNo        : row.receiptNo,
        paymentMode      : row.paymentMode,
      });
    }

    // Merge diary deposits into the same agent map
    for (const row of diaryRows) {
      const a = ensureAgent(row.agentId, row.agentName);
      const amt = round2(toNumber(row.amount));
      a.totalCollected    = round2(a.totalCollected + amt);
      a.diaryDepositCount++;
      a.diaryDepositTotal = round2(a.diaryDepositTotal + amt);

      a.transactions.push({
        id              : row.id,
        source          : 'diary',
        diaryAccountCode: row.diaryAccountCode,
        type            : 'deposit',
        amount          : amt,
        paymentDate     : row.paymentDate,
        receiptNo       : row.receiptNo,
      });
    }

    const agents = Array.from(agentMap.values());
    const grandTotal = round2(agents.reduce((s, a) => s + a.totalCollected, 0));

    return {
      period         : label,
      from           : fromDate,
      to             : toDate,
      grandTotal,
      totalTransactions: rows.length + diaryRows.length,
      agents,
    };
  }

  // ─── Day-wise breakdown for an agent (last N days) ─────────────────────────
  async agentDayWise(
    centreId: string,
    agentId: string,
    opts: { days?: number; from?: string; to?: string },
  ) {
    const days = opts.days ?? 30;
    let fromDate: string;
    let toDate: string;
    const normalizedFrom = this.normalizeDateParam(opts.from);
    const normalizedTo = this.normalizeDateParam(opts.to);

    if (normalizedFrom && normalizedTo) {
      fromDate = normalizedFrom;
      toDate   = normalizedTo;
    } else {
      const today = new Date();
      toDate   = format(today, 'yyyy-MM-dd');
      const start = new Date(today);
      start.setDate(start.getDate() - (days - 1));
      fromDate = format(start, 'yyyy-MM-dd');
    }

    const rows: any[] = await this.dataSource.query(`
      SELECT
        lt."paymentDate"::text  AS date,
        COUNT(*)::int           AS "txCount",
        SUM(lt.amount)::numeric AS "totalAmount",
        SUM(lt."principalPart")::numeric AS "principalAmount",
        SUM(lt."interestPart")::numeric  AS "interestAmount",
        SUM(lt."penaltyPart")::numeric   AS "penaltyAmount"
      FROM loan_transactions lt
      WHERE lt."centreId"    = $1
        AND lt."collectedBy" = $2
        AND lt."isReversed"  = false
        AND lt."paymentDate" BETWEEN $3 AND $4
      GROUP BY lt."paymentDate"
      ORDER BY lt."paymentDate" ASC
    `, [centreId, agentId, fromDate, toDate]);

    const agentInfo: any[] = await this.dataSource.query(
      `SELECT id, name, phone FROM users WHERE id = $1 LIMIT 1`, [agentId],
    );

    return {
      agent  : agentInfo[0] ?? null,
      from   : fromDate,
      to     : toDate,
      grandTotal       : round2(rows.reduce((s, r) => s + toNumber(r.totalAmount), 0)),
      totalTransactions: rows.reduce((s, r) => s + r.txCount, 0),
      dayWise: rows.map(r => ({
        date           : r.date,
        txCount        : r.txCount,
        totalAmount    : round2(toNumber(r.totalAmount)),
        principalAmount: round2(toNumber(r.principalAmount)),
        interestAmount : round2(toNumber(r.interestAmount)),
        penaltyAmount  : round2(toNumber(r.penaltyAmount)),
      })),
    };
  }

  // ─── Centre-level summary (for ADMIN dashboard) ───────────────────────────
  async centreSummary(
    centreId: string,
    opts: { period?: string; from?: string; to?: string },
  ) {
    const { fromDate, toDate, label } = this.resolvePeriod(opts.period, opts.from, opts.to);

    const rows: any[] = await this.dataSource.query(`
      SELECT
        combined."agentId",
        combined."agentName",
        SUM(combined."txCount")::int    AS "txCount",
        COALESCE(SUM(combined."totalCollected"),0)::numeric AS "totalCollected"
      FROM (
        SELECT
          u.id        AS "agentId",
          CASE WHEN u.role = 'admin' THEN 'ADMIN' ELSE u.name END AS "agentName",
          COUNT(lt.id)::int           AS "txCount",
          COALESCE(SUM(lt.amount),0)::numeric AS "totalCollected"
        FROM users u
        LEFT JOIN loan_transactions lt
          ON lt."collectedBy" = u.id
         AND lt."centreId"   = $1
         AND lt."isReversed" = false
         AND lt."paymentDate" BETWEEN $2 AND $3
        WHERE u."centreId" = $1
          AND u."deletedAt" IS NULL
        GROUP BY u.id, u.name, u.role

        UNION ALL

        SELECT
          u.id        AS "agentId",
          CASE WHEN u.role = 'admin' THEN 'ADMIN' ELSE u.name END AS "agentName",
          COUNT(dt.id)::int           AS "txCount",
          COALESCE(SUM(dt.amount),0)::numeric AS "totalCollected"
        FROM users u
        LEFT JOIN diary_transactions dt
          ON dt."performedBy" = u.id
         AND dt."centreId"   = $1
         AND dt."isReversed" = false
         AND dt.type = 'deposit'
         AND dt."transactionDate" BETWEEN $2 AND $3
        WHERE u."centreId" = $1
          AND u."deletedAt" IS NULL
        GROUP BY u.id, u.name, u.role
      ) combined
      GROUP BY combined."agentId", combined."agentName"
      ORDER BY "totalCollected" DESC
    `, [centreId, fromDate, toDate]);

    return {
      period        : label,
      from          : fromDate,
      to            : toDate,
      grandTotal    : round2(rows.reduce((s, r) => s + toNumber(r.totalCollected), 0)),
      totalTransactions: rows.reduce((s, r) => s + r.txCount, 0),
      byAgent: rows.map(r => ({
        agentId      : r.agentId,
        agentName    : r.agentName,
        txCount      : r.txCount,
        totalCollected: round2(toNumber(r.totalCollected)),
      })),
    };
  }

  // ─── Combined Transactions (Loan + Diary) ─────────────────────────────────
  /**
   * Returns a unified, paginated list of both LoanTransactions and DiaryTransactions.
   * All filters are optional and combinable.
   */
  async combinedTransactions(
    centreId: string,
    opts: {
      source?     : 'loan' | 'diary';
      agentId?    : string;
      customerId? : string;
      loanId?     : string;
      diaryId?    : string;
      from?       : string;
      to?         : string;
      page?       : number;
      limit?      : number;
    },
  ) {
    const page  = Math.max(1, opts.page  ?? 1);
    const limit = Math.min(200, opts.limit ?? 50);
    const normalizedFrom = this.normalizeDateParam(opts.from);
    const normalizedTo = this.normalizeDateParam(opts.to);

    const loanRows: any[]  = [];
    const diaryRows: any[] = [];
    const loanDisbursalRows: any[] = [];

    // ── LOAN TRANSACTIONS ───────────────────────────────────────────────────
    console.log('📋 Processing loans - opts.source:', opts.source);
    if (!opts.source || opts.source === 'loan') {
      const loanParams: any[] = [centreId];
      let loanWhere = `lt."centreId" = $1 AND lt."isReversed" = false`;

      if (normalizedFrom) {
        loanParams.push(normalizedFrom);
        loanWhere += ` AND lt."paymentDate" >= $${loanParams.length}`;
      }
      if (normalizedTo) {
        loanParams.push(normalizedTo);
        loanWhere += ` AND lt."paymentDate" <= $${loanParams.length}`;
      }
      if (opts.agentId) {
        if (opts.agentId === 'ADMIN') {
          loanWhere += ` AND agent.role = 'admin'`;
        } else {
          loanParams.push(opts.agentId);
          loanWhere += ` AND lt."collectedBy" = $${loanParams.length}`;
        }
      }
      if (opts.loanId) {
        loanParams.push(opts.loanId);
        loanWhere += ` AND lt."loanId" = $${loanParams.length}`;
      }
      if (opts.customerId) {
        loanParams.push(opts.customerId);
        loanWhere += ` AND l."customerId" = $${loanParams.length}`;
      }

      const loanSql = `
        SELECT
          lt.id,
          'loan'                        AS source,
          lt.type,
          lt.amount::numeric            AS amount,
          lt."principalPart"::numeric   AS "principalPart",
          lt."interestPart"::numeric    AS "interestPart",
          lt."penaltyPart"::numeric     AS "penaltyPart",
          lt."paymentDate"::text        AS "paymentDate",
          lt."paymentMode",
          lt."receiptNo",
          lt.notes,
          lt."loanId"                   AS "loanId",
          l."loanAccountNumber",
          NULL                          AS "diaryId",
          NULL                          AS "diaryAccountCode",
          l."loanType",
          l."customerId",
          cust.name                     AS "customerName",
          cust."customerCode"          AS "customerCode",
          lt."collectedBy"              AS "agentId",
          CASE WHEN agent.id IS NOT NULL AND agent.role = 'admin' THEN 'ADMIN' WHEN agent.id IS NOT NULL THEN agent.name ELSE NULL END AS "agentName",
          lt."createdAt"
        FROM loan_transactions lt
        JOIN loans  l     ON l.id    = lt."loanId"
        JOIN users  cust  ON cust.id = l."customerId"
        LEFT JOIN users agent ON agent.id = lt."collectedBy"
        WHERE ${loanWhere}
      `;
      const rows = await this.dataSource.query(loanSql, loanParams);
      loanRows.push(...rows);

      const loanDisbursalParams: any[] = [centreId];
      let loanDisbursalWhere = `l."centreId" = $1 AND l."deletedAt" IS NULL`;

      if (normalizedFrom) {
        loanDisbursalParams.push(normalizedFrom);
        loanDisbursalWhere += ` AND l."startDate" >= $${loanDisbursalParams.length}`;
      }
      if (normalizedTo) {
        loanDisbursalParams.push(normalizedTo);
        loanDisbursalWhere += ` AND l."startDate" <= $${loanDisbursalParams.length}`;
      }
      if (opts.agentId) {
        if (opts.agentId === 'ADMIN') {
          loanDisbursalWhere += ` AND agent.role = 'admin'`;
        } else {
          loanDisbursalParams.push(opts.agentId);
          loanDisbursalWhere += ` AND l."agentId" = $${loanDisbursalParams.length}`;
        }
      }
      if (opts.loanId) {
        loanDisbursalParams.push(opts.loanId);
        loanDisbursalWhere += ` AND l."id" = $${loanDisbursalParams.length}`;
      }
      if (opts.customerId) {
        loanDisbursalParams.push(opts.customerId);
        loanDisbursalWhere += ` AND l."customerId" = $${loanDisbursalParams.length}`;
      }

      const loanDisbursalSql = `
        SELECT
          l.id,
          'loan'                        AS source,
          'disbursal'                   AS type,
          l."disbursedAmount"::numeric AS amount,
          l."disbursedAmount"::numeric AS "principalPart",
          0::numeric                    AS "interestPart",
          0::numeric                    AS "penaltyPart",
          l."startDate"::text          AS "paymentDate",
          NULL                          AS "paymentMode",
          NULL                          AS "receiptNo",
          l.notes                       AS notes,
          l.id                          AS "loanId",
          l."loanAccountNumber",
          NULL                          AS "diaryId",
          NULL                          AS "diaryAccountCode",
          l."loanType",
          l."customerId",
          cust.name                     AS "customerName",
          cust."customerCode"          AS "customerCode",
          l."agentId"                  AS "agentId",
          CASE WHEN agent.id IS NOT NULL AND agent.role = 'admin' THEN 'ADMIN' WHEN agent.id IS NOT NULL THEN agent.name ELSE NULL END AS "agentName",
          l."createdAt"
        FROM loans l
        JOIN users cust  ON cust.id = l."customerId"
        LEFT JOIN users agent ON agent.id = l."agentId"
        WHERE ${loanDisbursalWhere}
      `;
      console.log('🔍 Loan Disbursal Query:', { sql: loanDisbursalSql.substring(0, 200), params: loanDisbursalParams });
      const disbursalRows = await this.dataSource.query(loanDisbursalSql, loanDisbursalParams);
      console.log('✅ Loan Disbursal Rows:', disbursalRows.length, 'rows found');
      loanDisbursalRows.push(...disbursalRows);
    }

    // ── DIARY TRANSACTIONS ──────────────────────────────────────────────────
    if (!opts.source || opts.source === 'diary') {
      const diaryParams: any[] = [centreId];
      let diaryWhere = `dt."centreId" = $1 AND dt."isReversed" = false`;

      if (normalizedFrom) {
        diaryParams.push(normalizedFrom);
        diaryWhere += ` AND dt."transactionDate" >= $${diaryParams.length}`;
      }
      if (normalizedTo) {
        diaryParams.push(normalizedTo);
        diaryWhere += ` AND dt."transactionDate" <= $${diaryParams.length}`;
      }
      if (opts.diaryId) {
        diaryParams.push(opts.diaryId);
        diaryWhere += ` AND dt."accountId" = $${diaryParams.length}`;
      }
      if (opts.customerId) {
        diaryParams.push(opts.customerId);
        diaryWhere += ` AND da."customerId" = $${diaryParams.length}`;
      }
      if (opts.agentId) {
        if (opts.agentId === 'ADMIN') {
          diaryWhere += ` AND agent.role = 'admin'`;
        } else {
          diaryParams.push(opts.agentId);
          diaryWhere += ` AND dt."performedBy" = $${diaryParams.length}`;
        }
      }

      const diarySql = `
        SELECT
          dt.id,
          'diary'                       AS source,
          dt.type,
          dt.amount::numeric            AS amount,
          NULL::numeric                 AS "principalPart",
          NULL::numeric                 AS "interestPart",
          NULL::numeric                 AS "penaltyPart",
          dt."transactionDate"::text     AS "paymentDate",
          NULL                          AS "paymentMode",
          dt."receiptNo"                AS "receiptNo",
          dt.notes                      AS notes,
          NULL                          AS "loanId",
          NULL                          AS "loanAccountNumber",
          dt."accountId"                AS "diaryId",
          da."accountCode"              AS "diaryAccountCode",
          NULL                          AS "loanType",
          da."customerId",
          cust.name                     AS "customerName",
          cust."customerCode"          AS "customerCode",
          dt."performedBy"              AS "agentId",
          CASE WHEN agent.id IS NOT NULL AND agent.role = 'admin' THEN 'ADMIN' WHEN agent.id IS NOT NULL THEN agent.name ELSE NULL END AS "agentName",
          dt."createdAt"
        FROM diary_transactions dt
        JOIN diary_accounts da ON da.id = dt."accountId" AND da."deletedAt" IS NULL
        JOIN users cust        ON cust.id = da."customerId"
        LEFT JOIN users agent  ON agent.id = dt."performedBy"
        WHERE ${diaryWhere}
      `;
      const rows = await this.dataSource.query(diarySql, diaryParams);
      diaryRows.push(...rows);
    }

    // ── MERGE, SORT, PAGINATE ───────────────────────────────────────────────
    console.log('📊 Transaction counts:', { disbursals: loanDisbursalRows.length, loans: loanRows.length, diary: diaryRows.length });
    const all = [...loanDisbursalRows, ...loanRows, ...diaryRows].sort((a, b) => {
      // Sort by paymentDate desc, then createdAt desc
      const dateA = a.paymentDate ?? '';
      const dateB = b.paymentDate ?? '';
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total  = all.length;
    const offset = (page - 1) * limit;
    const data   = all.slice(offset, offset + limit).map(row => ({
      id                : row.id,
      source            : row.source,
      type              : row.type,
      amount            : round2(toNumber(row.amount)),
      principalPart     : row.principalPart != null ? round2(toNumber(row.principalPart)) : null,
      interestPart      : row.interestPart  != null ? round2(toNumber(row.interestPart))  : null,
      penaltyPart       : row.penaltyPart   != null ? round2(toNumber(row.penaltyPart))   : null,
      paymentDate       : row.paymentDate,
      paymentMode       : row.paymentMode   ?? null,
      receiptNo         : row.receiptNo     ?? null,
      notes             : row.notes         ?? null,
      loanId            : row.loanId        ?? null,
      loanAccountNumber : row.loanAccountNumber ?? null,
      diaryId           : row.diaryId       ?? null,
      diaryAccountCode  : row.diaryAccountCode  ?? null,
      loanType          : row.loanType      ?? null,
      customerId        : row.customerId,
      customerName      : row.customerName,
      customerCode      : row.customerCode ?? null,
      agentId           : row.agentId       ?? null,
      agentName         : row.agentName     ?? null,
      createdAt         : row.createdAt,
    }));

    const PAYMENT_IN_TYPES = ['emi', 'full_payment', 'renewal'];

    const totalIn = all.reduce((s, r) => {
      const amt = toNumber(r.amount);
      if (r.source === 'loan' && PAYMENT_IN_TYPES.includes(r.type?.toLowerCase())) return s + amt;
      if (r.source === 'diary' && r.type?.toLowerCase() === 'deposit') return s + amt;
      return s;
    }, 0);

    const totalOut = all.reduce((s, r) => {
      const amt = toNumber(r.amount);
      if (r.source === 'loan' && r.type?.toLowerCase() === 'disbursal') return s + amt;
      if (r.source === 'diary' && r.type?.toLowerCase() === 'withdrawal') return s + amt;
      return s;
    }, 0);

    return {
      total,
      page,
      limit,
      totalIn: round2(totalIn),
      totalOut: round2(totalOut),
      data,
    };
  }

  // ─── Transaction Receipt ──────────────────────────────────────────────────
  async getTransactionReceipt(centreId: string, txId: string, source: 'loan' | 'diary') {
    if (source === 'loan') {
      const sql = `
        SELECT
          lt.id,
          'loan'                        AS source,
          lt.type,
          lt.amount::numeric            AS amount,
          lt."principalPart"::numeric   AS "principalPart",
          lt."interestPart"::numeric    AS "interestPart",
          lt."penaltyPart"::numeric     AS "penaltyPart",
          lt."paymentDate"::text        AS "paymentDate",
          lt."paymentMode",
          lt."receiptNo",
          lt.notes,
          lt."loanId"                   AS "loanId",
          l."loanAccountNumber",
          l."loanType",
          l."remainingBalance"::numeric AS "remainingBalance",
          l."customerId",
          cust.name                     AS "customerName",
          cust."customerCode"           AS "customerCode",
          cust.phone                    AS "customerPhone",
          cust.address                  AS "customerAddress",
          lt."collectedBy"              AS "agentId",
          CASE WHEN agent.role = 'admin' THEN 'ADMIN' ELSE agent.name END AS "agentName",
          c.name                        AS "centreName",
          c.id                          AS "centreId",
          lt."createdAt"
        FROM loan_transactions lt
        JOIN loans  l     ON l.id    = lt."loanId"
        JOIN users  cust  ON cust.id = l."customerId"
        LEFT JOIN users agent ON agent.id = lt."collectedBy"
        JOIN centres c ON c.id = lt."centreId"
        WHERE lt.id = $1 AND lt."centreId" = $2
      `;
      const rows = await this.dataSource.query(sql, [txId, centreId]);
      if (!rows.length) throw new Error('Transaction not found');
      const r = rows[0];
      return {
        ...r,
        amount: round2(toNumber(r.amount)),
        principalPart: r.principalPart != null ? round2(toNumber(r.principalPart)) : null,
        interestPart: r.interestPart != null ? round2(toNumber(r.interestPart)) : null,
        penaltyPart: r.penaltyPart != null ? round2(toNumber(r.penaltyPart)) : null,
        remainingBalance: round2(toNumber(r.remainingBalance)),
      };
    } else {
      const sql = `
        SELECT
          dt.id,
          'diary'                       AS source,
          dt.type,
          dt.amount::numeric            AS amount,
          dt."transactionDate"::text    AS "paymentDate",
          dt."receiptNo"                AS "receiptNo",
          dt.notes                      AS notes,
          dt."accountId"                AS "diaryId",
          da."accountCode"              AS "diaryAccountCode",
          da.balance::numeric           AS "remainingBalance",
          da."customerId",
          cust.name                     AS "customerName",
          cust."customerCode"           AS "customerCode",
          cust.phone                    AS "customerPhone",
          cust.address                  AS "customerAddress",
          dt."performedBy"              AS "agentId",
          CASE WHEN agent.id IS NOT NULL AND agent.role = 'admin' THEN 'ADMIN' WHEN agent.id IS NOT NULL THEN agent.name ELSE NULL END AS "agentName",
          c.name                        AS "centreName",
          c.id                          AS "centreId",
          dt."createdAt"
        FROM diary_transactions dt
        JOIN diary_accounts da ON da.id = dt."accountId"
        JOIN users cust        ON cust.id = da."customerId"
        LEFT JOIN users agent  ON agent.id = dt."performedBy"
        JOIN centres c ON c.id = dt."centreId"
        WHERE dt.id = $1 AND dt."centreId" = $2
      `;
      const rows = await this.dataSource.query(sql, [txId, centreId]);
      if (!rows.length) throw new Error('Transaction not found');
      const r = rows[0];
      return {
        ...r,
        amount: round2(toNumber(r.amount)),
        remainingBalance: round2(toNumber(r.remainingBalance)),
      };
    }
  }
}

