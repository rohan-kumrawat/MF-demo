/**
 * Seed Script — First-time database bootstrap
 * Run: npm run seed
 *
 * Creates:
 *  1. Centre: BHOINDA   → admin: bhoinda_admin  / Admin@123
 *  2. Centre: DHARAMRAY → admin: dharamray_admin / Admin@123
 *  3. Centre: TEST      → admin: test / test (for testing)
 *  4. Sequences for each centre (LOAN, RECEIPT, CUSTOMER)
 *
 * Safe to run multiple times — skips existing records.
 * To reset: truncate tables and re-run.
 */

import 'reflect-metadata';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// ── Entities ─────────────────────────────────────────────────────────────────
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

// ── Enums ─────────────────────────────────────────────────────────────────────
import { Role } from './common/enums/role.enum';
import { SequenceType } from './common/enums/sequence-type.enum';

// ── Centre config ─────────────────────────────────────────────────────────────
const CENTRES = [
  {
    name: 'BHOINDA',
    address: 'Bhoinda',
    centreCode: 'BHO',        // Used in LOAN-BHO-00001, RCP-BHO-00001 etc.
    adminUser: 'upendra.patel',
    adminName: 'Upendra Patel',
    adminEmail: 'kirtancsc.bhoinda@gmail.com',
  },
  {
    name: 'DHARAMRAY',
    address: 'Dharamray',
    centreCode: 'DHA',
    adminUser: 'narendra.rathode',
    adminName: 'Narendra Rathode',
    adminEmail: 'nrathode@hotmail.com',
  },
  {
    name: 'TEST',
    address: 'Test Centre',
    centreCode: 'TST',
    adminUser: 'test',
    adminName: 'Test Admin',
    adminEmail: 'test@example.com',
  },
] as const;

const ADMIN_PASSWORD = 'Admin@123';

// ─────────────────────────────────────────────────────────────────────────────

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'microfinance',
  synchronize: false,  // Mn-6: Use migrations — never auto-sync against production DB
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

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Connected to database\n');

  const centreRepo = AppDataSource.getRepository(Centre);
  const userRepo = AppDataSource.getRepository(User);
  const seqRepo = AppDataSource.getRepository(CentreSequence);

  // ── Remove old placeholder centre if exists ───────────────────────────────
  const oldCentre = await centreRepo.findOne({ where: { name: 'Main Centre' } });
  if (oldCentre) {
    // Only delete if no users are tied to it (safe to remove placeholder)
    const userCount = await userRepo.count({ where: { centreId: oldCentre.id } });
    if (userCount === 0) {
      await centreRepo.delete(oldCentre.id);
      console.log('🗑️  Removed old "Main Centre" placeholder\n');
    } else {
      console.log('⚠️  "Main Centre" has users — skipping deletion. Rename it manually if needed.\n');
    }
  }

  // ── Seed each centre ──────────────────────────────────────────────────────
  for (const cfg of CENTRES) {
    console.log(`── ${cfg.name} ${'─'.repeat(40 - cfg.name.length)}`);

    // 1. Centre
    let centre = await centreRepo.findOne({ where: { name: cfg.name } });
    if (!centre) {
      centre = await centreRepo.save(
        centreRepo.create({ name: cfg.name, address: cfg.address }),
      );
      console.log(`  ✅ Centre created  → id: ${centre.id}`);
    } else {
      console.log(`  ⏭️  Centre exists   → id: ${centre.id}`);
    }

    // 2. Admin user
    let admin = await userRepo.findOne({
      where: { centreId: centre.id, username: cfg.adminUser },
    });
    if (!admin) {
      // Use "test@123" as password for TEST centre, else use standard password
      const adminPass = cfg.name === 'TEST' ? 'test@123' : ADMIN_PASSWORD;
      const passwordHash = await bcrypt.hash(adminPass, 12);
      await userRepo.save(userRepo.create({
        centreId: centre.id,
        username: cfg.adminUser,
        passwordHash,
        role: Role.ADMIN,
        name: cfg.adminName,
        email: cfg.adminEmail,
        phone: null,
        address: null,
        isActive: true,
      }));
      console.log(`  ✅ Admin created   → username: ${cfg.adminUser}`);
    } else {
      console.log(`  ⏭️  Admin exists    → username: ${cfg.adminUser}`);
    }

    // 3. Sequences
    for (const type of [SequenceType.LOAN, SequenceType.RECEIPT, SequenceType.CUSTOMER]) {
      const exists = await seqRepo.findOne({ where: { centreId: centre.id, type } });
      if (!exists) {
        await seqRepo.save(seqRepo.create({
          centreId: centre.id,
          centreCode: cfg.centreCode,
          type,
          currentValue: 0,
        }));
        console.log(`  ✅ Sequence created → ${type} (${cfg.centreCode})`);
      } else {
        console.log(`  ⏭️  Sequence exists  → ${type}`);
      }
    }

    console.log('');
  }

  await AppDataSource.destroy();

  console.log('🎉 Seed complete!');
  console.log('═'.repeat(50));
  console.log('  Login URL : http://localhost:3000/api/v1/auth/login');
  console.log('  Password  : Admin@123  (change after first login!)\n');
  // Mn-2: Generate dynamically from CENTRES config — never goes stale
  for (const cfg of CENTRES) {
    const note = cfg.name === 'TEST' ? '  (password: test@123)' : '';
    console.log(`  ${cfg.name.padEnd(12)}→ username: ${cfg.adminUser}${note}`);
  }
  console.log('');
  console.log('═'.repeat(50));
  console.log('\n  Login body example:');
  console.log(`  { "centreName": "${CENTRES[0].name}", "username": "${CENTRES[0].adminUser}", "password": "Admin@123" }`);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
