/**
 * DEMO Seed Script — for recruiter demo
 * Run: npm run seed:demo
 *
 * Creates:
 *  - Centre: DEMO
 *  - Admin:  demo / demo@123
 *  - Agent:  agent.demo / demo@123
 *  - 10 Customers with realistic data
 *  - 10 Loans (EMI, Flexible, Weekly, Bullet) — mix of active & closed
 *  - Loan transactions (payment history)
 *  - Diary accounts with deposit history
 *  - Udhar Khata entries
 */

import 'reflect-metadata';
require('dotenv').config();
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Centre } from './modules/centres/entities/centre.entity';
import { User } from './modules/users/entities/user.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { CentreSequence } from './modules/sequences/entities/centre-sequence.entity';
import { Loan } from './modules/loans/entities/loan.entity';
import { LoanTransaction } from './modules/loans/entities/loan-transaction.entity';
import { DiaryAccount } from './modules/diary/entities/diary-account.entity';
import { DiaryTransaction } from './modules/diary/entities/diary-transaction.entity';
import { DailyRegisterDay } from './modules/daily-register/entities/daily-register-day.entity';
import { DailyRegisterEntry } from './modules/daily-register/entities/daily-register-entry.entity';
import { UdharPerson } from './modules/udhar-khata/entities/udhar-person.entity';
import { UdharEntry } from './modules/udhar-khata/entities/udhar-entry.entity';
import { AuditLog } from './modules/audit-logs/entities/audit-log.entity';

import { Role } from './common/enums/role.enum';
import { SequenceType } from './common/enums/sequence-type.enum';
import { LoanType } from './common/enums/loan-type.enum';
import { LoanStatus } from './common/enums/loan-status.enum';
import { PaymentMode } from './common/enums/payment-mode.enum';
import { LoanTransactionType } from './common/enums/loan-transaction-type.enum';
import { DiaryTransactionType } from './common/enums/diary-transaction-type.enum';
import { UdharEntryType } from './common/enums/udhar-entry-type.enum';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST ?? 'localhost'),
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DATABASE_URL ? undefined : (process.env.DB_USERNAME ?? 'postgres'),
  password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD ?? 'postgres'),
  database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME ?? 'microfinance_demo'),
  ssl: process.env.DB_SSL === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'))
    ? { rejectUnauthorized: false }
    : false,
  synchronize: true,
  logging: false,
  entities: [
    Centre, User, RefreshToken, CentreSequence,
    Loan, LoanTransaction,
    DiaryAccount, DiaryTransaction,
    DailyRegisterDay, DailyRegisterEntry,
    UdharPerson, UdharEntry,
    AuditLog,
  ],
});

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateOnly(d: Date): string {
  return d.toISOString().split('T')[0];
}

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Connected to microfinance_demo\n');

  const centreRepo = AppDataSource.getRepository(Centre);
  const userRepo   = AppDataSource.getRepository(User);
  const seqRepo    = AppDataSource.getRepository(CentreSequence);
  const loanRepo   = AppDataSource.getRepository(Loan);
  const txRepo     = AppDataSource.getRepository(LoanTransaction);
  const diaryRepo  = AppDataSource.getRepository(DiaryAccount);
  const diaryTxRepo= AppDataSource.getRepository(DiaryTransaction);
  const udharPersonRepo = AppDataSource.getRepository(UdharPerson);
  const udharEntryRepo  = AppDataSource.getRepository(UdharEntry);

  const PASS_HASH = await bcrypt.hash('demo@123', 12);

  // ── 1. Centre ────────────────────────────────────────────────────────────────
  let centre = await centreRepo.findOne({ where: { name: 'DEMO' } });
  if (!centre) {
    centre = await centreRepo.save(centreRepo.create({ name: 'DEMO', address: 'Demo City, India' }));
    console.log(`✅ Centre created → id: ${centre.id}`);
  } else {
    console.log(`⏭️  Centre exists → id: ${centre.id}`);
  }
  const cid = centre.id;

  // ── 2. Sequences ─────────────────────────────────────────────────────────────
  const CENTRE_CODE = 'DMO';
  const seqTypes = [SequenceType.LOAN, SequenceType.RECEIPT, SequenceType.CUSTOMER, SequenceType.DIARY, SequenceType.UDHAR_KHATA];
  const seqMap: Record<string, CentreSequence> = {};
  for (const type of seqTypes) {
    let seq = await seqRepo.findOne({ where: { centreId: cid, type } });
    if (!seq) {
      seq = await seqRepo.save(seqRepo.create({ centreId: cid, centreCode: CENTRE_CODE, type, currentValue: 0 }));
    }
    seqMap[type] = seq;
  }
  console.log('✅ Sequences ready');

  async function nextSeq(type: SequenceType): Promise<string> {
    const seq = seqMap[type];
    seq.currentValue += 1;
    await seqRepo.save(seq);
    const padded = String(seq.currentValue).padStart(5, '0');
    if (type === SequenceType.LOAN)     return `LOAN-${CENTRE_CODE}-${padded}`;
    if (type === SequenceType.RECEIPT)  return `RCP-${CENTRE_CODE}-${padded}`;
    if (type === SequenceType.CUSTOMER) return `CUST-${CENTRE_CODE}-${padded}`;
    if (type === SequenceType.DIARY)    return `DIARY-${CENTRE_CODE}-${padded}`;
    return `UDH-${CENTRE_CODE}-${padded}`;
  }

  // ── 3. Admin & Agent users ────────────────────────────────────────────────
  let admin = await userRepo.findOne({ where: { centreId: cid, username: 'demo' } });
  if (!admin) {
    admin = await userRepo.save(userRepo.create({
      centreId: cid, username: 'demo', passwordHash: PASS_HASH,
      role: Role.ADMIN, name: 'Demo Admin', email: 'demo@microfinance.com',
      phone: '9876500000', address: 'Demo City', isActive: true,
    }));
    console.log('✅ Admin created → demo / demo@123');
  }

  let agent = await userRepo.findOne({ where: { centreId: cid, username: 'agent.demo' } });
  if (!agent) {
    agent = await userRepo.save(userRepo.create({
      centreId: cid, username: 'agent.demo', passwordHash: PASS_HASH,
      role: Role.AGENT, name: 'Ramesh Kumar (Agent)', email: 'agent@microfinance.com',
      phone: '9876500001', address: 'Demo City', isActive: true,
    }));
    console.log('✅ Agent created → agent.demo / demo@123');
  }

  // ── 4. Customers ─────────────────────────────────────────────────────────────
  const customerData = [
    { name: 'Sunita Devi',      phone: '9812345601', fh: 'Ramesh Prasad',   aadhar: '2345 6789 0001', addr: 'Ward 3, Rampur' },
    { name: 'Mohan Lal',        phone: '9812345602', fh: 'Shyam Lal',       aadhar: '2345 6789 0002', addr: 'Main Bazaar, Sitapur' },
    { name: 'Geeta Kumari',     phone: '9812345603', fh: 'Vijay Kumar',      aadhar: '2345 6789 0003', addr: 'Village Khera' },
    { name: 'Rajesh Sharma',    phone: '9812345604', fh: 'Deepak Sharma',    aadhar: '2345 6789 0004', addr: 'Gandhi Nagar, Dist A' },
    { name: 'Anita Yadav',      phone: '9812345605', fh: 'Suresh Yadav',     aadhar: '2345 6789 0005', addr: 'Laxmi Colony' },
    { name: 'Kamlesh Patel',    phone: '9812345606', fh: 'Bharat Patel',     aadhar: '2345 6789 0006', addr: 'Near Shiv Temple' },
    { name: 'Savitri Bai',      phone: '9812345607', fh: 'Manoj Singh',      aadhar: '2345 6789 0007', addr: 'Chhatarpur Road' },
    { name: 'Deepak Tiwari',    phone: '9812345608', fh: 'Shri Ram Tiwari',  aadhar: '2345 6789 0008', addr: 'Tiwari Mohalla' },
    { name: 'Pushpa Gupta',     phone: '9812345609', fh: 'Arvind Gupta',     aadhar: '2345 6789 0009', addr: 'Station Road' },
    { name: 'Lokesh Verma',     phone: '9812345610', fh: 'Dinesh Verma',     aadhar: '2345 6789 0010', addr: 'New Colony, Block B' },
  ];

  const customers: User[] = [];
  for (const cd of customerData) {
    const uname = cd.name.toLowerCase().replace(/ /g, '.');
    let cust = await userRepo.findOne({ where: { centreId: cid, username: uname } });
    if (!cust) {
      const code = await nextSeq(SequenceType.CUSTOMER);
      cust = await userRepo.save(userRepo.create({
        centreId: cid, username: uname, passwordHash: PASS_HASH,
        role: Role.CUSTOMER, name: cd.name, phone: cd.phone,
        address: cd.addr, fatherHusbandName: cd.fh,
        aadharNumber: cd.aadhar, customerCode: code,
        memberSince: daysAgo(Math.floor(Math.random() * 365 + 180)),
        isActive: true,
      }));
    }
    customers.push(cust);
  }
  console.log(`✅ ${customers.length} customers ready`);

  // ── 5. Loans ──────────────────────────────────────────────────────────────────
  interface LoanDef {
    custIdx: number;
    type: LoanType;
    principal: number;
    rate: number;
    tenure?: number;
    startDaysAgo: number;
    status: LoanStatus;
    purpose: string;
  }

  const loanDefs: LoanDef[] = [
    { custIdx:0, type: LoanType.EMI,      principal:50000, rate:18, tenure:12, startDaysAgo:180, status:LoanStatus.ACTIVE,     purpose:'Business expansion' },
    { custIdx:1, type: LoanType.EMI,      principal:30000, rate:18, tenure:6,  startDaysAgo:90,  status:LoanStatus.ACTIVE,     purpose:'Medical treatment' },
    { custIdx:2, type: LoanType.FLEXIBLE, principal:15000, rate:20, startDaysAgo:60,  status:LoanStatus.ACTIVE,     purpose:'Home repair' },
    { custIdx:3, type: LoanType.WEEKLY,   principal:20000, rate:15, tenure:26, startDaysAgo:120, status:LoanStatus.ACTIVE,     purpose:'Agriculture seeds' },
    { custIdx:4, type: LoanType.BULLET,   principal:40000, rate:12, tenure:12, startDaysAgo:200, status:LoanStatus.ACTIVE,     purpose:'Shop renovation' },
    { custIdx:5, type: LoanType.EMI,      principal:25000, rate:18, tenure:12, startDaysAgo:400, status:LoanStatus.CLOSED,     purpose:'Two-wheeler purchase' },
    { custIdx:6, type: LoanType.FLEXIBLE, principal:10000, rate:20, startDaysAgo:300, status:LoanStatus.CLOSED,     purpose:'Festival expenses' },
    { custIdx:7, type: LoanType.WEEKLY,   principal:18000, rate:15, tenure:20, startDaysAgo:50,  status:LoanStatus.ACTIVE,     purpose:'Dairy farm setup' },
    { custIdx:8, type: LoanType.EMI,      principal:60000, rate:16, tenure:24, startDaysAgo:10,  status:LoanStatus.ACTIVE,     purpose:'Education fee' },
    { custIdx:9, type: LoanType.BULLET,   principal:35000, rate:14, tenure:6,  startDaysAgo:500, status:LoanStatus.PRE_CLOSED, purpose:'Land development' },
  ];

  const loans: Loan[] = [];
  for (const def of loanDefs) {
    const cust = customers[def.custIdx];
    const loanNo = await nextSeq(SequenceType.LOAN);
    const startDate = daysAgo(def.startDaysAgo);
    const fileCharge = def.principal * 0.01;
    const otherCharge = 500;
    const disbursed = def.principal - fileCharge - otherCharge;
    const totalInterest = (def.principal * def.rate / 100) * ((def.tenure ?? 12) / 12);
    const totalPayable = def.principal + totalInterest;

    let emiAmount: number | null = null;
    let dailyInstallment: number | null = null;
    let weeklyInstallment: number | null = null;
    let totalDays: number | null = null;
    let totalWeeks: number | null = null;

    if (def.type === LoanType.EMI) {
      emiAmount = Math.round(totalPayable / (def.tenure ?? 12));
    } else if (def.type === LoanType.FLEXIBLE) {
      totalDays = 200;
      dailyInstallment = Math.round(totalPayable / totalDays);
    } else if (def.type === LoanType.WEEKLY) {
      totalWeeks = def.tenure ?? 26;
      weeklyInstallment = Math.round(totalPayable / totalWeeks);
    }

    const totalPaid = def.status === LoanStatus.CLOSED || def.status === LoanStatus.PRE_CLOSED
      ? totalPayable
      : Math.min(totalPayable * 0.4, totalPayable - 1000);
    const remaining = totalPayable - totalPaid;

    const loan = await loanRepo.save(loanRepo.create({
      loanAccountNumber: loanNo,
      centreId: cid,
      customerId: cust.id,
      agentId: agent.id,
      loanType: def.type,
      principalAmount: def.principal,
      interestRate: def.rate,
      tenureMonths: def.tenure ?? null,
      fileCharge,
      otherCharge,
      disbursedAmount: disbursed,
      purposeOfLoan: def.purpose,
      emiPaymentMode: PaymentMode.CASH,
      totalPayable,
      dailyInstallment,
      totalDays,
      weeklyInstallment,
      totalWeeks,
      emiAmount,
      startDate,
      endDate: def.status !== LoanStatus.ACTIVE ? daysAgo(Math.max(1, def.startDaysAgo - 30)) : null,
      totalPaid,
      remainingBalance: remaining,
      status: def.status,
      closedAt: def.status !== LoanStatus.ACTIVE ? daysAgo(Math.max(1, def.startDaysAgo - 30)) : null,
      hasPreviousLoan: false,
      guarantors: [{
        name: 'Guarantor Person',
        phone: '9800000000',
        relation: 'Friend',
        aadharNumber: '1234 5678 9000',
        address: 'Same Village',
      }],
    }));
    loans.push(loan);

    // ── Loan Transactions ─────────────────────────────────────────────────────
    const numTx = def.status !== LoanStatus.ACTIVE ? 6 : 3;
    let runningPaid = 0;
    for (let t = 0; t < numTx; t++) {
      const payDaysAgo = def.startDaysAgo - (t + 1) * (def.type === LoanType.WEEKLY ? 7 : 30);
      if (payDaysAgo < 0) break;
      const txAmount = def.type === LoanType.EMI ? (emiAmount ?? 5000)
        : def.type === LoanType.WEEKLY ? (weeklyInstallment ?? 2000)
        : 1500;
      const principal = Math.round(txAmount * 0.7);
      const interest  = txAmount - principal;
      runningPaid += txAmount;
      const receiptNo = await nextSeq(SequenceType.RECEIPT);
      await txRepo.save(txRepo.create({
        centreId: cid,
        loanId: loan.id,
        customerId: cust.id,
        type: LoanTransactionType.EMI,
        amount: txAmount,
        principalPart: principal,
        interestPart: interest,
        penaltyPart: 0,
        diaryAmount: 0,
        paymentMode: t % 3 === 0 ? PaymentMode.UPI : PaymentMode.CASH,
        receiptNo,
        paymentDate: daysAgo(payDaysAgo) as any,
        collectedBy: agent.id,
        notes: t === 0 ? 'First installment' : null,
        isReversed: false,
      }));
    }
  }
  console.log(`✅ ${loans.length} loans + transactions created`);

  // ── 6. Diary Accounts ────────────────────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const cust = customers[i];
    const code = await nextSeq(SequenceType.DIARY);
    let acc = await diaryRepo.findOne({ where: { centreId: cid, customerId: cust.id } });
    if (!acc) {
      const balance = (i + 1) * 3000;
      acc = await diaryRepo.save(diaryRepo.create({
        centreId: cid, customerId: cust.id,
        diaryName: `${cust.name} Savings`,
        accountCode: code, balance,
        cycleStartDate: daysAgo(180), isActive: true,
      }));

      // 3 deposits per account
      let runBal = 0;
      for (let d = 3; d >= 1; d--) {
        const amt = (i + 1) * 1000;
        const before = runBal;
        runBal += amt;
        await diaryTxRepo.save(diaryTxRepo.create({
          centreId: cid, accountId: acc.id,
          customerId: cust.id,
          type: DiaryTransactionType.DEPOSIT,
          amount: amt, balanceBefore: before, balanceAfter: runBal,
          transactionDate: daysAgo(d * 30) as any,
          notes: `Monthly deposit #${4 - d}`,
          performedBy: admin.id, isReversed: false,
        }));
      }
    }
  }
  console.log('✅ Diary accounts + transactions created');

  // ── 7. Udhar Khata ───────────────────────────────────────────────────────────
  const udharPersons = [
    { name: 'Ramji Hardware Store',    phone: '9800001111', addr: 'Main Market',   balance: 15000 },
    { name: 'Sunil Medical Shop',      phone: '9800002222', addr: 'Hospital Road', balance: -5000 },
    { name: 'Ganesh Rice Mill',        phone: '9800003333', addr: 'Mandi Area',    balance: 8500  },
    { name: 'Pappu Electrical Works',  phone: '9800004444', addr: 'Industrial Area', balance: 3200 },
    { name: 'Anand Fertilizers',       phone: '9800005555', addr: 'Near Bus Stand', balance: -2000 },
  ];

  for (const pd of udharPersons) {
    const code = await nextSeq(SequenceType.UDHAR_KHATA);
    let person = await udharPersonRepo.findOne({ where: { centreId: cid, name: pd.name } });
    if (!person) {
      person = await udharPersonRepo.save(udharPersonRepo.create({
        centreId: cid, name: pd.name, phone: pd.phone,
        address: pd.addr, personCode: code,
        netBalance: pd.balance, isActive: true,
      }));
      // 2 udhar entries per person
      const type1 = pd.balance >= 0 ? UdharEntryType.DIYA : UdharEntryType.LIYA;
      const amt1  = Math.abs(pd.balance) + 2000;
      await udharEntryRepo.save(udharEntryRepo.create({
        centreId: cid, personId: person.id,
        entryType: type1, amount: amt1,
        balanceAfter: type1 === UdharEntryType.DIYA ? amt1 : -amt1,
        entryDate: daysAgo(45) as any,
        remark: 'Initial supply / advance',
        createdBy: admin.id,
      }));
      const returnAmt = 2000;
      await udharEntryRepo.save(udharEntryRepo.create({
        centreId: cid, personId: person.id,
        entryType: type1 === UdharEntryType.DIYA ? UdharEntryType.LIYA : UdharEntryType.DIYA,
        amount: returnAmt,
        balanceAfter: pd.balance,
        entryDate: daysAgo(10) as any,
        remark: 'Partial payment received',
        createdBy: admin.id,
      }));
    }
  }
  console.log('✅ Udhar Khata persons + entries created');

  await AppDataSource.destroy();

  console.log('\n' + '═'.repeat(55));
  console.log('🎉  DEMO SEED COMPLETE!');
  console.log('═'.repeat(55));
  console.log('  Backend URL : http://localhost:3001/api/v1');
  console.log('  Centre      : DEMO');
  console.log('  Admin login : demo / demo@123');
  console.log('  Agent login : agent.demo / demo@123');
  console.log('  Customers   : 10  (password: demo@123)');
  console.log('  Loans       : 10  (EMI, Flexible, Weekly, Bullet)');
  console.log('  Diary Accs  : 5');
  console.log('  Udhar Items : 5');
  console.log('═'.repeat(55) + '\n');
}

seed().catch((err) => {
  console.error('❌ Demo seed failed:', err.message);
  process.exit(1);
});
