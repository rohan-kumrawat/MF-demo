# Micro Finance Management System — Backend

NestJS + PostgreSQL + TypeORM production-ready backend.

---

## Quick Start

```bash
# 1. Copy env
cp .env.example .env
# Edit .env with your DB credentials

# 2. Install
npm install

# 3. Create DB
createdb microfinance

# 4. Start dev server (synchronize=true creates tables on first run)
npm run start:dev

# 5. After tables are created, set TYPEORM_SYNCHRONIZE=false in .env
```

---

## Project Structure

```
src/
├── main.ts                        # App bootstrap — global pipes, filters
├── app.module.ts                  # Root module — TypeORM + all modules
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser() param decorator
│   │   └── roles.decorator.ts          # @Roles(...) metadata decorator
│   ├── enums/
│   │   ├── role.enum.ts                # admin | agent | customer | kiosk
│   │   ├── loan-type.enum.ts           # emi | bullet | flexible
│   │   ├── loan-status.enum.ts         # active | closed | pre-closed
│   │   ├── loan-transaction-type.enum.ts
│   │   ├── payment-mode.enum.ts        # cash | upi | bank
│   │   ├── sequence-type.enum.ts       # loan | customer | receipt
│   │   ├── diary-transaction-type.enum.ts
│   │   ├── udhar-entry-type.enum.ts    # liya | diya
│   │   └── audit-action.enum.ts        # create | update | delete | reverse
│   ├── filters/
│   │   └── http-exception.filter.ts    # Uniform error responses
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # Layer 1: validates JWT
│   │   ├── roles.guard.ts              # Checks role against @Roles()
│   │   └── centre-isolation.guard.ts   # Layer 2: strips centreId from body
│   └── utils/
│       └── math.util.ts               # round2(), toNumber()
└── modules/
    ├── auth/          # JWT login, refresh token rotation, password management
    ├── users/         # Unified user table (admin/agent/customer/kiosk)
    ├── centres/       # Centre read
    ├── sequences/     # Atomic loan/customer/receipt number generation
    ├── loans/         # Full loan lifecycle + overdue computation
    ├── diary/         # Savings wallet with interest eligibility
    ├── daily-register/ # Kiosk daily cash register (2-table design)
    ├── udhar-khata/   # Kiosk informal ledger (2-table design)
    └── audit-logs/    # Immutable audit trail
```

---

## API Reference

All routes prefixed with `/api/v1`. All protected routes require:
```
Authorization: Bearer <accessToken>
```

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Returns `accessToken` + `refreshToken` |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | Any | Invalidate refresh token |
| POST | `/auth/change-password` | Any | Own password |
| POST | `/auth/reset-password/:userId` | Admin | Reset any user's password |

> **Login body** must include `centreId` (only time centreId comes from client):
> ```json
> { "centreId": "uuid", "username": "admin1", "password": "secret" }
> ```

### Users
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/users` | Admin | Create user (any role) |
| GET | `/users` | Admin | List all users in centre |
| GET | `/users/:id` | Admin / Own | Get user |
| PATCH | `/users/:id` | Admin / Own | Update user |
| DELETE | `/users/:id` | Admin | Soft delete |

### Loans
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/loans` | Admin | Create loan |
| GET | `/loans` | Admin, Agent | List loans (agent sees assigned only) |
| GET | `/loans/:id` | Admin, Agent, Customer-own | Get loan + computed overdue |
| POST | `/loans/:id/transactions` | Admin, Agent | Add payment/penalty/adjustment |
| GET | `/loans/:id/transactions` | Admin, Agent, Customer-own | List transactions |
| POST | `/loans/:id/pre-close` | Admin | Pre-close loan |
| PATCH | `/loans/:id/transactions/:txId/reverse` | Admin | Reverse a transaction |

**Create transaction body:**
```json
{
  "type": "payment",
  "amount": 1000,
  "principalPart": 800,
  "interestPart": 200,
  "penaltyPart": 0,
  "paymentMode": "cash",
  "paymentDate": "2026-04-21"
}
```
> `amount` MUST equal `principalPart + interestPart + penaltyPart` or request is rejected.

### Diary
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/diary/accounts` | Admin | Open diary account |
| GET | `/diary/accounts` | Admin | List accounts |
| GET | `/diary/accounts/:id` | Admin, Customer-own | Get account |
| DELETE | `/diary/accounts/:id` | Admin | Delete diary account (soft delete; history retained) |
| GET | `/diary/accounts/:id/transactions` | Admin, Customer-own | Get transactions |
| POST | `/diary/accounts/:id/deposit` | Admin | Deposit |
| POST | `/diary/accounts/:id/withdraw` | Admin | Withdraw (balance check enforced) |
| POST | `/diary/accounts/:id/interest` | Admin | Add interest (1-year eligibility checked) |

### Daily Register
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/daily-register/days` | Admin, Kiosk | Open a day |
| GET | `/daily-register/days` | Admin, Kiosk | List days |
| GET | `/daily-register/days/:dayId/entries` | Admin, Kiosk | List entries |
| POST | `/daily-register/days/:dayId/entries` | Admin, Kiosk | Add entry |
| PATCH | `/daily-register/entries/:id` | Admin, Kiosk | Edit entry (recalcs balances) |
| DELETE | `/daily-register/entries/:id` | Admin, Kiosk | Delete entry (recalcs balances) |

### Udhar Khata
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/udhar-khata/persons` | Admin, Kiosk | Create person ledger |
| GET | `/udhar-khata/persons` | Admin, Kiosk | List persons |
| GET | `/udhar-khata/persons/:id/entries` | Admin, Kiosk | Get entries |
| POST | `/udhar-khata/persons/:id/entries` | Admin, Kiosk | Add entry |
| PATCH | `/udhar-khata/entries/:id` | Admin, Kiosk | Edit entry (recalcs balance) |
| DELETE | `/udhar-khata/entries/:id` | Admin, Kiosk | Delete entry (recalcs balance) |

### Audit Logs
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/audit-logs?page=1&limit=50` | Admin | Paginated audit trail |

---

## Centre Isolation

`centreId` is **never** accepted from request body/query on protected routes.
It is always extracted from the JWT payload. Three-layer enforcement:

1. `JwtAuthGuard` — validates token, attaches `req.user = { sub, centreId, role }`
2. `CentreIsolationGuard` — strips `centreId` from `req.body` and `req.query` if present
3. Service layer — every DB query includes `WHERE centreId = req.user.centreId`

---

## Sequence Number Formats

| Type | Format | Example |
|---|---|---|
| Loan | `LOAN-C{code}-{00000}` | `LOAN-C1-00042` |
| Customer | `CUST-C{code}-{00000}` | `CUST-C1-00007` |
| Receipt | `RCP-C{code}-{00000}` | `RCP-C1-00198` |

Generated atomically inside DB transactions via `centre_sequences` table.

---

## Business Rules Summary

| Rule | Enforcement |
|---|---|
| Loan transactions blocked on closed/pre-closed loans | Service guard |
| `amount = principalPart + interestPart + penaltyPart` | DTO validator + service |
| `receiptNo` always generated for all transaction types | Service + `NOT NULL` column |
| Diary withdrawal blocked if `amount > balance` | Service check |
| Diary interest only after 365 days from `cycleStartDate` | Service check |
| Partial diary withdrawal resets `cycleStartDate` | Service |
| Diary account delete is soft-delete; transactions are retained for audit | `deleteAccount()` |
| Daily register balance recalculated on edit/delete | `recalcDay()` in DB transaction |
| Udhar balance recalculated on edit/delete | `recalcPerson()` in DB transaction |
| Financial records never hard-deleted | `isReversed` flag |
| EMI overdue uses `floor(daysPassed / 30)` (no partial months) | LoansService |
| All monetary values rounded to 2 decimal places | `round2()` util |
| pg driver returns decimals as strings | `toNumber()` util used throughout |
