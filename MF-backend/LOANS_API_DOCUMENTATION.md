# LOANS MODULE API Documentation (Updated)

## Overview
The Loans Module manages loan accounts for customers with EMI, bullet, and flexible repayment options. It tracks disbursals, repayments, and generates amortization schedules with automatic balance calculations.

---

## Authentication & Authorization
- **Guard**: JWT Bearer token required
- **Role Required**: 
  - `ADMIN` for create/pre-close/reverse operations
  - `ADMIN` or `AGENT` for transaction recording
  - `ADMIN`, `AGENT`, or `CUSTOMER` for view operations
- **Header**: `Authorization: Bearer <token>`
- **Centre Isolation**: Users can only access loans within their centre

---

## Enums & Valid Values

### Loan Type
```
emi       - Equal Monthly Instalment (fixed monthly payment)
bullet    - Bullet loan (interest + principal at end)
flexible  - Flexible daily instalment
```

### Loan Status
```
active      - Loan is active and accepting payments
closed      - Loan fully paid off
pre-closed  - Loan marked for pre-closure (stopped EMI)
```

### Transaction Type
```
emi           - Regular monthly EMI payment
full_payment  - Full loan settlement (pay remaining balance at once)
penalty       - Late fee / penalty charge
other         - Miscellaneous credit / advance payment
```

### Payment Mode
```
cash  - Cash payment
upi   - UPI payment
bank  - Bank transfer
```

---

## Endpoints

### 1. Create Loan
**POST** `/api/v1/loans`

Creates a new loan account for a customer. The backend auto-computes: `loanAccountNumber`, `endDate`, `disbursedAmount`.

#### Authorization
- Role: `ADMIN` only

#### Request Body
```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "agentId": "650e8400-e29b-41d4-a716-446655440001",
  "loanType": "emi",
  "principalAmount": 50000,
  "interestRate": 18,
  "tenureMonths": 12,
  "fileCharge": 500,
  "otherCharge": 200,
  "totalPayable": 59000,
  "emiAmount": 4917,
  "startDate": "2026-04-23",
  "purposeOfLoan": "Business",
  "emiPaymentMode": "cash",
  "guarantors": [
    {
      "name": "Suresh Patel",
      "phone": "9876543210",
      "aadharNumber": "1234 5678 9012",
      "address": "Bhoinda"
    },
    {
      "name": "Mahesh Kumar",
      "phone": "9876543211",
      "aadharNumber": "9876 5432 1098",
      "address": "Bhoinda"
    }
  ],
  "notes": "First loan"
}
```

#### Field Constraints

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `customerId` | uuid | ✓ | Valid UUID | Customer UUID |
| `agentId` | uuid | ✗ | Valid UUID | Agent managing the loan |
| `loanType` | string | ✓ | `emi`, `bullet`, `flexible` | Type of loan |
| `principalAmount` | number | ✓ | ≥ 1 | Principal loan amount (2 decimals) |
| `interestRate` | number | ✓ | ≥ 0 | Annual rate in % (e.g., 18 for 18%) |
| `tenureMonths` | number | ✗ | ≥ 1 | Required for `emi` and `bullet` loans |
| `fileCharge` | number | ✗ | ≥ 0 | Processing/file fee (2 decimals) |
| `otherCharge` | number | ✗ | ≥ 0 | Other charges (2 decimals) |
| `totalPayable` | number | ✓ | ≥ 1 | Total repayable amount (2 decimals) |
| `emiAmount` | number | ✗ | ≥ 0 | Monthly EMI for `emi` loans (2 decimals) |
| `dailyInstallment` | number | ✗ | ≥ 0 | Daily instalment for `flexible` loans |
| `totalDays` | number | ✗ | ≥ 1 | Total days for `flexible` loans |
| `startDate` | string (ISO date) | ✓ | YYYY-MM-DD | Loan start date |
| `purposeOfLoan` | string | ✗ | max 255 chars | Purpose description |
| `emiPaymentMode` | string | ✗ | `cash`, `upi`, `bank` | EMI payment method |
| `guarantors` | array | ✗ | max 2 items | Guarantor details |
| `guarantors[].name` | string | ✓ if guarantor | - | Guarantor name |
| `guarantors[].phone` | string | ✓ if guarantor | - | Guarantor phone |
| `guarantors[].aadharNumber` | string | ✓ if guarantor | - | Guarantor Aadhar |
| `guarantors[].address` | string | ✓ if guarantor | - | Guarantor address |
| `notes` | string | ✗ | - | Additional notes |

#### EMI Calculation (Flat Rate)
```
totalPayable = principalAmount + (principalAmount × interestRate/100 × tenureMonths/12)
             = 50000 + (50000 × 0.18 × 1) = 59000

emiAmount = totalPayable / tenureMonths
          = 59000 / 12 ≈ 4917
```

#### Response (201)
```json
{
  "id": "uuid",
  "loanAccountNumber": "LOAN-C1-00001",
  "centreId": "uuid",
  "customerId": "uuid",
  "agentId": "uuid",
  "loanType": "emi",
  "principalAmount": "50000.00",
  "interestRate": "18.00",
  "tenureMonths": 12,
  "fileCharge": "500.00",
  "otherCharge": "200.00",
  "disbursedAmount": "49300.00",
  "totalPayable": "59000.00",
  "emiAmount": "4917.00",
  "dailyInstallment": null,
  "totalDays": null,
  "startDate": "2026-04-23",
  "endDate": "2027-04-23",
  "purposeOfLoan": "Business",
  "emiPaymentMode": "cash",
  "guarantors": [...],
  "totalPaid": "0.00",
  "remainingBalance": "59000.00",
  "status": "active",
  "notes": "First loan",
  "closedAt": null,
  "deletedAt": null,
  "createdAt": "2026-04-27T09:00:00.000Z",
  "updatedAt": "2026-04-27T09:00:00.000Z"
}
```

#### Auto-Computed Fields
- **`loanAccountNumber`**: Format `LOAN-C{centreCode}-{00000}` (auto-incremented)
- **`disbursedAmount`**: `principalAmount - fileCharge - otherCharge = 50000 - 500 - 200 = 49300`
- **`endDate`**: `startDate + tenureMonths (for EMI/bullet loans)`
- **`remainingBalance`**: Initialized to `totalPayable`

#### Error Cases
- **400 Bad Request**:
  - Invalid field types or values
  - Missing required fields
  - Invalid UUIDs
  - Invalid date format
- **403 Forbidden**: User not ADMIN

---

### 2. List Loans (with Filters)
**GET** `/api/v1/loans`

Retrieves loans with optional filtering and sorting. Returns enriched with EMI statistics.

#### Query Parameters

| Parameter | Type | Optional | Values | Notes |
|-----------|------|----------|--------|-------|
| `status` | string | ✓ | `active`, `closed`, `pre-closed` | Filter by status |
| `from` | string | ✓ | ISO date (YYYY-MM-DD) | Start date filter |
| `to` | string | ✓ | ISO date (YYYY-MM-DD) | End date filter |
| `search` | string | ✓ | - | Search by loanAccountNumber |
| `customerId` | uuid | ✓ | - | Filter by customer |
| `agentId` | uuid | ✓ | - | Filter by agent |
| `overdue` | string | ✓ | `true`, `false` | Filter overdue loans only |

#### Examples

```bash
# All active loans
curl "http://localhost:3000/api/v1/loans?status=active" \
  -H "Authorization: Bearer <token>"

# Overdue loans only
curl "http://localhost:3000/api/v1/loans?overdue=true" \
  -H "Authorization: Bearer <token>"

# Date range
curl "http://localhost:3000/api/v1/loans?from=2026-01-01&to=2026-04-30" \
  -H "Authorization: Bearer <token>"

# Search by loan account number
curl "http://localhost:3000/api/v1/loans?search=LOAN-C1-00001" \
  -H "Authorization: Bearer <token>"

# Customer's loans
curl "http://localhost:3000/api/v1/loans?customerId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"

# Agent's loans
curl "http://localhost:3000/api/v1/loans?agentId=550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
[
  {
    "id": "uuid",
    "loanAccountNumber": "LOAN-C1-00001",
    "loanType": "emi",
    "principalAmount": "50000.00",
    "interestRate": "18.00",
    "tenureMonths": 12,
    "totalPayable": "59000.00",
    "emiAmount": "4917.00",
    "startDate": "2026-04-23",
    "endDate": "2027-04-23",
    "totalPaid": "4917.00",
    "remainingBalance": "54083.00",
    "status": "active",
    "emiPaymentMode": "cash",
    "guarantors": [...],
    "notes": "First loan",
    "createdAt": "2026-04-27T09:00:00.000Z",
    "updatedAt": "2026-04-27T09:00:00.000Z",
    "totalEmis": 12,
    "emisPaid": 1,
    "emisRemaining": 11,
    "overdue": 0,
    "nextEmiDueDate": "2026-06-23"
  }
]
```

#### Computed Fields (Only in Response)
- **`totalEmis`**: Total number of EMIs for EMI loans
- **`emisPaid`**: Number of EMIs paid
- **`emisRemaining`**: Number of EMIs pending
- **`overdue`**: Number of overdue days (0 if not applicable)
- **`nextEmiDueDate`**: Next EMI due date (ISO format)

---

### 3. Get Dashboard Statistics
**GET** `/api/v1/loans/dashboard`

Centre-level loan portfolio statistics.

#### Authorization
- Role: `ADMIN` only

#### Examples
```bash
curl http://localhost:3000/api/v1/loans/dashboard \
  -H "Authorization: Bearer <adminToken>"
```

#### Response (200)
```json
{
  "totalLoans": 5,
  "activeLoans": 4,
  "closedLoans": 1,
  "preClosedLoans": 0,
  "overdueLoans": 1,
  "totalDisbursed": 200000.00,
  "totalOutstanding": 180000.00,
  "totalOverdueAmount": 4917.00,
  "collectedToday": 9834.00,
  "collectedThisMonth": 24585.00,
  "transactionsToday": 2
}
```

| Field | Description |
|-------|-------------|
| `totalLoans` | Total loans created |
| `activeLoans` | Loans with status = active |
| `closedLoans` | Loans with status = closed |
| `preClosedLoans` | Loans with status = pre_closed |
| `overdueLoans` | Count of loans with overdue EMIs |
| `totalDisbursed` | Sum of disbursedAmount |
| `totalOutstanding` | Sum of remainingBalance |
| `totalOverdueAmount` | Sum of overdue balances |
| `collectedToday` | Amount collected today |
| `collectedThisMonth` | Amount collected this month |
| `transactionsToday` | Transaction count today |

---

### 4. Get Collections Report
**GET** `/api/v1/loans/report/collections`

Agent-wise collection report for a date range.

#### Authorization
- Role: `ADMIN` only

#### Query Parameters

| Parameter | Type | Optional | Notes |
|-----------|------|----------|-------|
| `from` | string | ✓ | Start date (YYYY-MM-DD) |
| `to` | string | ✓ | End date (YYYY-MM-DD) |
| `agentId` | uuid | ✓ | Filter by specific agent |

#### Examples

```bash
# All time
curl "http://localhost:3000/api/v1/loans/report/collections" \
  -H "Authorization: Bearer <adminToken>"

# Date range
curl "http://localhost:3000/api/v1/loans/report/collections?from=2026-04-01&to=2026-04-30" \
  -H "Authorization: Bearer <adminToken>"

# Specific agent
curl "http://localhost:3000/api/v1/loans/report/collections?agentId=550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <adminToken>"
```

#### Response (200)
```json
{
  "period": {
    "from": "2026-04-01",
    "to": "2026-04-30"
  },
  "totalCollected": 24585.00,
  "totalTransactions": 5,
  "byAgent": [
    {
      "agentId": "uuid",
      "totalAmount": 24585.00,
      "emiCount": 4,
      "penaltyCount": 1,
      "otherCount": 0
    }
  ]
}
```

---

### 5. Get Customer Loan Summary
**GET** `/api/v1/loans/customers/:customerId/summary`

Customer's complete loan portfolio overview.

#### URL Parameters
| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `customerId` | uuid | ✓ | Customer UUID |

#### Authorization
- Role: `ADMIN` or `AGENT`

#### Example
```bash
curl http://localhost:3000/api/v1/loans/customers/550e8400-e29b-41d4-a716-446655440000/summary \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
{
  "customerId": "uuid",
  "totalLoans": 2,
  "activeLoans": 1,
  "closedLoans": 1,
  "totalDisbursed": 99300.00,
  "totalPayable": 109000.00,
  "totalPaid": 9834.00,
  "totalOutstanding": 99166.00,
  "totalOverdue": 0,
  "loans": [
    {
      "id": "uuid",
      "loanAccountNumber": "LOAN-C1-00001",
      "loanType": "emi",
      "status": "active",
      "principalAmount": "50000.00",
      "remainingBalance": "54083.00",
      "overdue": 0,
      "totalEmis": 12,
      "emisPaid": 1,
      "emisRemaining": 11,
      "nextEmiDueDate": "2026-06-23"
    }
  ]
}
```

#### Error Cases
- **404 Not Found**: Customer not found
- **403 Forbidden**: Insufficient permissions

---

### 6. Get Single Loan
**GET** `/api/v1/loans/:id`

Full loan details with computed EMI statistics.

#### URL Parameters
| Param | Type | Required |
|-------|------|----------|
| `id` | uuid | ✓ |

#### Example
```bash
curl http://localhost:3000/api/v1/loans/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
{
  "id": "uuid",
  "loanAccountNumber": "LOAN-C1-00001",
  "centreId": "uuid",
  "customerId": "uuid",
  "agentId": "uuid",
  "loanType": "emi",
  "principalAmount": "50000.00",
  "interestRate": "18.00",
  "tenureMonths": 12,
  "fileCharge": "500.00",
  "otherCharge": "200.00",
  "disbursedAmount": "49300.00",
  "totalPayable": "59000.00",
  "emiAmount": "4917.00",
  "startDate": "2026-04-23",
  "endDate": "2027-04-23",
  "purposeOfLoan": "Business",
  "emiPaymentMode": "cash",
  "guarantors": [...],
  "totalPaid": "4917.00",
  "remainingBalance": "54083.00",
  "status": "active",
  "notes": "First loan",
  "createdAt": "2026-04-27T09:00:00.000Z",
  "updatedAt": "2026-04-27T09:00:00.000Z",
  "totalEmis": 12,
  "emisPaid": 1,
  "emisRemaining": 11,
  "overdue": 0,
  "nextEmiDueDate": "2026-06-23"
}
```

#### Error Cases
- **404 Not Found**: Loan not found
- **403 Forbidden**: Insufficient permissions

---

### 7. Get Repayment Schedule
**GET** `/api/v1/loans/:id/schedule`

Full amortization/repayment schedule for the loan.

#### URL Parameters
| Param | Type | Required |
|-------|------|----------|
| `id` | uuid | ✓ |

#### Example
```bash
curl http://localhost:3000/api/v1/loans/550e8400-e29b-41d4-a716-446655440000/schedule \
  -H "Authorization: Bearer <token>"
```

#### Response (200) - EMI Loan
```json
[
  {
    "emiNumber": 1,
    "dueDate": "2026-05-23",
    "expectedAmount": 4917.00,
    "breakup": {
      "principal": 4167.00,
      "interest": 750.00
    },
    "status": "paid",
    "paidAmount": 4917.00,
    "paidDate": "2026-05-20",
    "receiptNo": "RCP-C1-00001"
  },
  {
    "emiNumber": 2,
    "dueDate": "2026-06-23",
    "expectedAmount": 4917.00,
    "breakup": {
      "principal": 4167.00,
      "interest": 750.00
    },
    "status": "pending",
    "paidAmount": 0.00,
    "paidDate": null,
    "receiptNo": null
  }
]
```

#### Schedule Field Details

| Field | Type | Description |
|-------|------|-------------|
| `emiNumber` | number | EMI sequence (1, 2, 3, ...) |
| `dueDate` | date | Expected payment date |
| `expectedAmount` | number | Expected EMI amount |
| `breakup.principal` | number | Principal portion |
| `breakup.interest` | number | Interest portion |
| `status` | string | `paid`, `partial`, `pending`, `overdue` |
| `paidAmount` | number | Total paid against this EMI |
| `paidDate` | date | Actual payment date (if paid) |
| `receiptNo` | string | Receipt number (if paid) |

#### EMI Breakup Calculation (Flat Rate)
```
Monthly Interest = (principalAmount × annualRate/100) / 12
Principal Part = emiAmount - monthlyInterest
Interest Part = monthlyInterest
```

#### Error Cases
- **404 Not Found**: Loan not found or not an EMI loan
- **403 Forbidden**: Insufficient permissions

---

### 8. Record Payment Transaction
**POST** `/api/v1/loans/:id/transactions`

Records a payment against the loan. Backend auto-splits into principal/interest/penalty.

#### URL Parameters
| Param | Type | Required |
|-------|------|----------|
| `id` | uuid | ✓ |

#### Authorization
- Role: `ADMIN` or `AGENT`

#### Request Body

**Regular EMI Payment:**
```json
{
  "type": "emi",
  "amount": 4917,
  "paymentMode": "cash",
  "paymentDate": "2026-05-20",
  "notes": "May EMI"
}
```

**Full Settlement:**
```json
{
  "type": "full_payment",
  "amount": 54083,
  "paymentMode": "upi",
  "paymentDate": "2026-05-20",
  "notes": "Full settlement"
}
```

**Penalty Payment:**
```json
{
  "type": "penalty",
  "amount": 500,
  "paymentMode": "cash",
  "paymentDate": "2026-05-20",
  "notes": "Late payment fee"
}
```

**Advance Payment (Other):**
```json
{
  "type": "other",
  "amount": 1000,
  "paymentMode": "bank",
  "paymentDate": "2026-05-20",
  "notes": "Advance payment"
}
```

**With Diary Deduction:**
```json
{
  "type": "emi",
  "amount": 4917,
  "diaryAmount": 2000,
  "diaryAccountId": "diary-account-uuid",
  "paymentMode": "cash",
  "paymentDate": "2026-05-20",
  "notes": "EMI from diary"
}
```

#### Field Constraints

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `type` | string | ✓ | `emi`, `full_payment`, `penalty`, `other` | Transaction type |
| `amount` | number | ✓ | ≥ 0.01 | Total amount received (2 decimals) |
| `diaryAmount` | number | ✗ | ≥ 0 | Amount deducted from diary (2 decimals) |
| `diaryAccountId` | uuid | ✗ | Valid UUID | Required if `diaryAmount > 0` |
| `paymentMode` | string | ✓ | `cash`, `upi`, `bank` | Payment method |
| `paymentDate` | string (ISO date) | ✓ | YYYY-MM-DD | Payment date |
| `notes` | string | ✗ | - | Optional notes |

#### Auto-Split Logic

The backend automatically splits the amount based on transaction type:

**EMI Transaction:**
```
monthlyInterest = (principalAmount × interestRate/100) / 12
interestPart = min(amount, monthlyInterest)
principalPart = amount - interestPart
penaltyPart = 0
```

**Full Payment Transaction:**
```
remainingEmis = tenureMonths - emisPaid
remainingInterest = remainingEmis × monthlyInterest
interestPart = min(amount, remainingInterest)
principalPart = amount - interestPart
penaltyPart = 0
```

**Penalty Transaction:**
```
principalPart = 0
interestPart = 0
penaltyPart = amount
```

**Other Transaction:**
```
principalPart = amount
interestPart = 0
penaltyPart = 0
```

#### Response (201)
```json
{
  "id": "uuid",
  "centreId": "uuid",
  "loanId": "uuid",
  "customerId": "uuid",
  "type": "emi",
  "amount": "4917.00",
  "principalPart": "4167.00",
  "interestPart": "750.00",
  "penaltyPart": "0.00",
  "diaryAmount": "0.00",
  "paymentMode": "cash",
  "receiptNo": "RCP-C1-00001",
  "paymentDate": "2026-05-20",
  "collectedBy": "agent-uuid",
  "notes": "May EMI",
  "isReversed": false,
  "createdAt": "2026-05-20T14:30:00.000Z"
}
```

#### Auto-Generated Fields
- **`receiptNo`**: Format `RCP-C{centreCode}-{00000}` (auto-incremented)
- **`collectedBy`**: Set from authenticated user ID
- **`principalPart`, `interestPart`, `penaltyPart`**: Auto-computed based on type

#### Error Cases
- **404 Not Found**: Loan not found
- **400 Bad Request**:
  - Invalid amount
  - `diaryAmount > 0` but `diaryAccountId` not provided
  - Insufficient diary balance (if using diary deduction)
  - Amount exceeds remaining balance (for `full_payment`)
  - Invalid date format
- **403 Forbidden**: Insufficient permissions

---

### 9. Get Loan Transactions
**GET** `/api/v1/loans/:id/transactions`

Lists all payment transactions for a loan.

#### URL Parameters
| Param | Type | Required |
|-------|------|----------|
| `id` | uuid | ✓ |

#### Example
```bash
curl http://localhost:3000/api/v1/loans/550e8400-e29b-41d4-a716-446655440000/transactions \
  -H "Authorization: Bearer <token>"
```

#### Response (200)
```json
[
  {
    "id": "uuid",
    "centreId": "uuid",
    "loanId": "uuid",
    "customerId": "uuid",
    "type": "emi",
    "amount": "4917.00",
    "principalPart": "4167.00",
    "interestPart": "750.00",
    "penaltyPart": "0.00",
    "diaryAmount": "0.00",
    "paymentMode": "cash",
    "receiptNo": "RCP-C1-00001",
    "paymentDate": "2026-05-20",
    "collectedBy": "agent-uuid",
    "notes": "May EMI",
    "isReversed": false,
    "createdAt": "2026-05-20T14:30:00.000Z"
  }
]
```

#### Error Cases
- **404 Not Found**: Loan not found
- **403 Forbidden**: Insufficient permissions

---

### 10. Pre-Close Loan
**POST** `/api/v1/loans/:id/pre-close`

Marks a loan as pre-closed. No further EMIs will be collected.

#### URL Parameters
| Param | Type | Required |
|-------|------|----------|
| `id` | uuid | ✓ |

#### Authorization
- Role: `ADMIN` only

#### Request Body
```json
{
  "notes": "Customer requested pre-closure"
}
```

#### Field Constraints

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `notes` | string | ✗ | - | Optional reason |

#### Example
```bash
curl -X POST http://localhost:3000/api/v1/loans/550e8400-e29b-41d4-a716-446655440000/pre-close \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Customer requested pre-closure"}'
```

#### Response (200)
```json
{
  "id": "uuid",
  "loanAccountNumber": "LOAN-C1-00001",
  "loanType": "emi",
  "status": "pre-closed",
  "remainingBalance": "54083.00",
  "notes": "Customer requested pre-closure",
  "updatedAt": "2026-05-20T15:00:00.000Z",
  "...all other loan fields..."
}
```

#### Error Cases
- **404 Not Found**: Loan not found
- **400 Bad Request**: Cannot pre-close a closed or already pre-closed loan
- **403 Forbidden**: User not ADMIN

---

### 11. Reverse Transaction
**PATCH** `/api/v1/loans/:id/transactions/:txId/reverse`

Reverses/undoes a payment transaction. Automatically adjusts loan balances.

#### URL Parameters
| Param | Type | Required |
|-------|------|----------|
| `id` | uuid | ✓ |
| `txId` | uuid | ✓ |

#### Authorization
- Role: `ADMIN` only

#### Request Body
```json
{
  "notes": "Wrong entry, reversing"
}
```

#### Field Constraints

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `notes` | string | ✗ | - | Reason for reversal |

#### Example
```bash
curl -X PATCH http://localhost:3000/api/v1/loans/550e8400-e29b-41d4-a716-446655440000/transactions/tx-uuid/reverse \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Wrong entry, reversing"}'
```

#### Response (200)
```json
{
  "id": "uuid",
  "loanId": "uuid",
  "type": "emi",
  "amount": "4917.00",
  "principalPart": "4167.00",
  "interestPart": "750.00",
  "penaltyPart": "0.00",
  "paymentMode": "cash",
  "receiptNo": "RCP-C1-00001",
  "paymentDate": "2026-05-20",
  "collectedBy": "agent-uuid",
  "notes": "Wrong entry, reversing",
  "isReversed": true,
  "reversalNotes": "Wrong entry, reversing",
  "createdAt": "2026-05-20T14:30:00.000Z"
}
```

#### Error Cases
- **404 Not Found**: Loan or transaction not found
- **400 Bad Request**:
  - Transaction already reversed
  - Cannot reverse a closed loan
- **403 Forbidden**: User not ADMIN

---

## Important Behaviors

### Balance Management
- **Disbursed Amount**: `principalAmount - fileCharge - otherCharge`
- **Total Paid**: Sum of all successful transaction amounts
- **Remaining Balance**: `totalPayable - totalPaid`
- **Auto-updated**: On every transaction

### Loan Closure
- Loan automatically closes when `remainingBalance <= 0`
- Status changes to `closed`
- No further payments accepted

### Pre-Closure
- Status changes to `pre-closed`
- Loan stops accepting regular EMI transactions
- Remaining balance can be paid via `full_payment` or `other`

### EMI Statistics
- **Computed Live** (never stored):
  - `totalEmis`: Total number of EMIs
  - `emisPaid`: Count of EMIs paid
  - `emisRemaining`: Pending EMI count
  - `nextEmiDueDate`: Calculated as `startDate + (emisPaid + 1) months`
  - `overdue`: Calculated as `max(0, daysSince(nextEmiDueDate))`

### Audit & Logging
- All transactions logged to `audit_logs` table
- IP address and User-Agent captured for transactions
- Reversals tracked with original transaction reference

### Centre Isolation
- Users can only create/view/edit loans within their centre
- `centreId` extracted from JWT token automatically

---

## Example Workflows

### Complete EMI Loan Lifecycle

**1. Create EMI loan:**
```bash
curl -X POST http://localhost:3000/api/v1/loans \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "loanType": "emi",
    "principalAmount": 50000,
    "interestRate": 18,
    "tenureMonths": 12,
    "fileCharge": 500,
    "otherCharge": 200,
    "totalPayable": 59000,
    "emiAmount": 4917,
    "startDate": "2026-04-23",
    "purposeOfLoan": "Business",
    "emiPaymentMode": "cash"
  }'
```

**2. View loan details:**
```bash
curl http://localhost:3000/api/v1/loans/loan-uuid \
  -H "Authorization: Bearer <token>"
```

**3. View repayment schedule:**
```bash
curl http://localhost:3000/api/v1/loans/loan-uuid/schedule \
  -H "Authorization: Bearer <token>"
```

**4. Record first EMI payment:**
```bash
curl -X POST http://localhost:3000/api/v1/loans/loan-uuid/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "emi",
    "amount": 4917,
    "paymentMode": "cash",
    "paymentDate": "2026-05-20",
    "notes": "May EMI"
  }'
```

**5. View all transactions:**
```bash
curl http://localhost:3000/api/v1/loans/loan-uuid/transactions \
  -H "Authorization: Bearer <token>"
```

**6. Record penalty for late payment:**
```bash
curl -X POST http://localhost:3000/api/v1/loans/loan-uuid/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "penalty",
    "amount": 100,
    "paymentMode": "cash",
    "paymentDate": "2026-06-25",
    "notes": "Late payment penalty"
  }'
```

**7. Full settlement:**
```bash
curl -X POST http://localhost:3000/api/v1/loans/loan-uuid/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "full_payment",
    "amount": 49166,
    "paymentMode": "bank",
    "paymentDate": "2026-11-20",
    "notes": "Full settlement"
  }'
```

---

## Data Integrity Notes

### Precision
- All monetary amounts use **precision 12, scale 2** (up to 9,999,999,999.99)
- All calculations use `round2()` function to prevent floating-point errors

### Transactions
- Payment recording uses database transactions
- Automatic rollback on errors
- Balance updates are atomic

### Unique Constraints
- **loanAccountNumber**: Unique per centre
- **receiptNo**: Globally unique

### Soft Deletes
- Deleted loans marked with `deletedAt` timestamp
- Excluded from list/search queries

---

## Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description or array of validation errors",
  "timestamp": "2026-04-27T09:00:00.000Z",
  "path": "/api/v1/loans"
}
```

