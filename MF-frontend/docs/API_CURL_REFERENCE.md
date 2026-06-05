# Microfinance Backend API Curl Reference

Base URL: `http://localhost:3000/api/v1`

Use these headers for protected routes:

```bash
export ACCESS_TOKEN="your-access-token"
export REFRESH_TOKEN="your-refresh-token"
```

```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" ...
```

## Auth Module

### POST /auth/login

```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "secret123",
    "centreName": "BHOINDA"
  }'
```

Expected response:

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "b8d3f0d4-5a4a-4d4d-9b2a-9c8f4f62c111",
    "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
    "centreName": "BHOINDA",
    "role": "admin"
  }
}
```

### POST /auth/refresh

```bash
curl -X POST "http://localhost:3000/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

Expected response:

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "b8d3f0d4-5a4a-4d4d-9b2a-9c8f4f62c111",
    "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
    "centreName": null,
    "role": "admin"
  }
}
```

### POST /auth/forgot-password

```bash
curl -X POST "http://localhost:3000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

Expected response:

```json
{
  "message": "If that email address is in our database, we will send you an email to reset your password."
}
```

### POST /auth/reset-password-otp

```bash
curl -X POST "http://localhost:3000/api/v1/auth/reset-password-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newSecret123"
  }'
```

Expected response:

```json
{
  "message": "Password has been reset successfully."
}
```

### POST /auth/logout

```bash
curl -X POST "http://localhost:3000/api/v1/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

Expected response:

```json
{}
```

### POST /auth/change-password

```bash
curl -X POST "http://localhost:3000/api/v1/auth/change-password" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldSecret123",
    "newPassword": "newSecret123"
  }'
```

Expected response:

```json
{}
```

### POST /auth/reset-password/:userId

```bash
curl -X POST "http://localhost:3000/api/v1/auth/reset-password/USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "resetSecret123"
  }'
```

Expected response:

```json
{}
```

## Users Module

### POST /users

```bash
curl -X POST "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent1",
    "password": "secret123",
    "role": "agent",
    "name": "Rahul Kumar",
    "phone": "9876543210",
    "address": "Village Road",
    "memberSince": "2026-04-29"
  }'
```

Expected response:

```json
{
  "id": "b3bbf66a-0b8c-4a1d-a90f-04a7d74e7c22",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "username": "agent1",
  "passwordHash": "$2b$12$...",
  "email": null,
  "resetOtp": null,
  "resetOtpExpiry": null,
  "role": "agent",
  "name": "Rahul Kumar",
  "phone": "9876543210",
  "address": "Village Road",
  "customerCode": null,
  "fatherHusbandName": null,
  "aadharNumber": null,
  "memberSince": "2026-04-29",
  "isActive": true,
  "deletedAt": null,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

### GET /users

```bash
curl -X GET "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
[
  {
    "id": "b3bbf66a-0b8c-4a1d-a90f-04a7d74e7c22",
    "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
    "username": "agent1",
    "passwordHash": "$2b$12$...",
    "email": null,
    "resetOtp": null,
    "resetOtpExpiry": null,
    "role": "agent",
    "name": "Rahul Kumar",
    "phone": "9876543210",
    "address": "Village Road",
    "customerCode": null,
    "fatherHusbandName": null,
    "aadharNumber": null,
    "memberSince": "2026-04-29",
    "isActive": true,
    "deletedAt": null,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
]
```

### GET /users/:id

```bash
curl -X GET "http://localhost:3000/api/v1/users/USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: same `User` object as above.

### PATCH /users/:id

```bash
curl -X PATCH "http://localhost:3000/api/v1/users/USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "phone": "9999999999",
    "isActive": true
  }'
```

Expected response: updated `User` object.

### DELETE /users/:id

```bash
curl -X DELETE "http://localhost:3000/api/v1/users/USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{}
```

## Centres Module

### GET /centres

```bash
curl -X GET "http://localhost:3000/api/v1/centres" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
[
  {
    "id": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
    "name": "BHOINDA",
    "address": "Main Road, Bhoinda",
    "createdAt": "2026-04-29T10:00:00.000Z"
  }
]
```

## Loans Module

### POST /loans

```bash
curl -X POST "http://localhost:3000/api/v1/loans" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID",
    "agentId": "AGENT_ID",
    "loanType": "emi",
    "principalAmount": 100000,
    "interestRate": 18,
    "tenureMonths": 12,
    "fileCharge": 1000,
    "otherCharge": 500,
    "totalPayable": 118000,
    "emiAmount": 9833.33,
    "startDate": "2026-04-29",
    "purposeOfLoan": "Business expansion",
    "emiPaymentMode": "cash",
    "guarantors": [
      {
        "name": "Suresh Kumar",
        "phone": "9000000000",
        "aadharNumber": "123412341234",
        "address": "Village A"
      }
    ],
    "notes": "Initial loan"
  }'
```

Expected response:

```json
{
  "id": "loan-uuid",
  "loanAccountNumber": "LOAN-C1-00001",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "customerId": "CUSTOMER_ID",
  "agentId": "AGENT_ID",
  "loanType": "emi",
  "principalAmount": 100000,
  "interestRate": 18,
  "tenureMonths": 12,
  "fileCharge": 1000,
  "otherCharge": 500,
  "disbursedAmount": 98500,
  "purposeOfLoan": "Business expansion",
  "emiPaymentMode": "cash",
  "guarantors": [
    {
      "name": "Suresh Kumar",
      "phone": "9000000000",
      "aadharNumber": "123412341234",
      "address": "Village A"
    }
  ],
  "totalPayable": 118000,
  "dailyInstallment": null,
  "totalDays": null,
  "emiAmount": 9833.33,
  "startDate": "2026-04-29",
  "endDate": "2027-04-29T00:00:00.000Z",
  "totalPaid": 0,
  "remainingBalance": 118000,
  "status": "active",
  "closedAt": null,
  "notes": "Initial loan",
  "deletedAt": null,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

### GET /loans/dashboard

```bash
curl -X GET "http://localhost:3000/api/v1/loans/dashboard" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{
  "totalLoans": 10,
  "activeLoans": 8,
  "closedLoans": 1,
  "preClosedLoans": 1,
  "overdueLoans": 2,
  "totalDisbursed": 750000,
  "totalOutstanding": 420000,
  "totalOverdueAmount": 25000,
  "collectedToday": 12000,
  "collectedThisMonth": 98000,
  "transactionsToday": 6
}
```

### GET /loans/report/collections

```bash
curl -X GET "http://localhost:3000/api/v1/loans/report/collections?from=2026-04-01&to=2026-04-29&agentId=AGENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{
  "period": {
    "from": "2026-04-01",
    "to": "2026-04-29"
  },
  "totalCollected": 45000,
  "totalTransactions": 12,
  "byAgent": [
    {
      "agentId": "AGENT_ID",
      "totalAmount": 45000,
      "emiCount": 10,
      "penaltyCount": 1,
      "otherCount": 1
    }
  ]
}
```

### GET /loans/customers/:customerId/summary

```bash
curl -X GET "http://localhost:3000/api/v1/loans/customers/CUSTOMER_ID/summary" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{
  "customerId": "CUSTOMER_ID",
  "totalLoans": 2,
  "activeLoans": 1,
  "closedLoans": 1,
  "totalDisbursed": 150000,
  "totalPayable": 178000,
  "totalPaid": 60000,
  "totalOutstanding": 118000,
  "totalOverdue": 4000,
  "loans": [
    {
      "id": "loan-uuid",
      "loanAccountNumber": "LOAN-C1-00001",
      "loanType": "emi",
      "status": "active",
      "principalAmount": 100000,
      "remainingBalance": 98000,
      "overdue": 4000,
      "totalEmis": 12,
      "emisPaid": 5,
      "emisRemaining": 7,
      "nextEmiDueDate": "2026-05-29"
    }
  ]
}
```

### GET /loans

```bash
curl -X GET "http://localhost:3000/api/v1/loans?status=active&overdue=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of loan objects with `overdue` and, for EMI loans, `totalEmis`, `emisPaid`, `emisRemaining`, `nextEmiDueDate`.

### GET /loans/:id

```bash
curl -X GET "http://localhost:3000/api/v1/loans/LOAN_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: single loan object with computed `overdue` and EMI stats when applicable.

### GET /loans/:id/schedule

```bash
curl -X GET "http://localhost:3000/api/v1/loans/LOAN_ID/schedule" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response for EMI loan:

```json
[
  {
    "emiNumber": 1,
    "dueDate": "2026-05-29",
    "expectedAmount": 9833.33,
    "breakup": {
      "principal": 8333.33,
      "interest": 1500
    },
    "status": "pending",
    "paidAmount": 0,
    "paidDate": null,
    "receiptNo": null
  }
]
```

### POST /loans/:id/transactions

```bash
curl -X POST "http://localhost:3000/api/v1/loans/LOAN_ID/transactions" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "emi",
    "amount": 5000,
    "diaryAmount": 1000,
    "diaryAccountId": "DIARY_ACCOUNT_ID",
    "paymentMode": "cash",
    "paymentDate": "2026-04-29",
    "notes": "Monthly collection"
  }'
```

Expected response:

```json
{
  "id": "tx-uuid",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "loanId": "LOAN_ID",
  "customerId": "CUSTOMER_ID",
  "type": "emi",
  "amount": 5000,
  "principalPart": 3500,
  "interestPart": 1500,
  "penaltyPart": 0,
  "diaryAmount": 1000,
  "paymentMode": "cash",
  "receiptNo": "RCP-C1-00001",
  "paymentDate": "2026-04-29",
  "collectedBy": "USER_ID",
  "notes": "Monthly collection",
  "isReversed": false,
  "reversedBy": null,
  "reversedAt": null,
  "linkedDiaryTxId": "diary-tx-uuid",
  "createdAt": "2026-04-29T10:00:00.000Z"
}
```

### GET /loans/:id/transactions

```bash
curl -X GET "http://localhost:3000/api/v1/loans/LOAN_ID/transactions" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of loan transaction objects.

### POST /loans/:id/pre-close

```bash
curl -X POST "http://localhost:3000/api/v1/loans/LOAN_ID/pre-close" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Pre-closed by customer request"
  }'
```

Expected response: updated loan object with `status: "pre-closed"` and `closedAt` set.

### PATCH /loans/:id/transactions/:txId/reverse

```bash
curl -X PATCH "http://localhost:3000/api/v1/loans/LOAN_ID/transactions/TX_ID/reverse" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Wrong entry reversed"
  }'
```

Expected response: reversed loan transaction object with `isReversed: true`.

## Diary Module

### POST /diary/accounts

```bash
curl -X POST "http://localhost:3000/api/v1/diary/accounts" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID"
  }'
```

Expected response:

```json
{
  "id": "diary-account-uuid",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "customerId": "CUSTOMER_ID",
  "balance": 0,
  "cycleStartDate": null,
  "lastWithdrawalDate": null,
  "isActive": true,
  "deletedAt": null,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

### GET /diary/accounts

```bash
curl -X GET "http://localhost:3000/api/v1/diary/accounts" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of diary account objects with nested `customer` summary fields.

### GET /diary/accounts/:id

```bash
curl -X GET "http://localhost:3000/api/v1/diary/accounts/ACCOUNT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: diary account object with nested `customer` summary.

### GET /diary/accounts/:id/transactions

```bash
curl -X GET "http://localhost:3000/api/v1/diary/accounts/ACCOUNT_ID/transactions" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of diary transaction objects.

### POST /diary/accounts/:id/deposit

```bash
curl -X POST "http://localhost:3000/api/v1/diary/accounts/ACCOUNT_ID/deposit" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "transactionDate": "2026-04-29",
    "notes": "Initial savings deposit"
  }'
```

Expected response:

```json
{
  "id": "diary-tx-uuid",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "accountId": "ACCOUNT_ID",
  "customerId": "CUSTOMER_ID",
  "type": "deposit",
  "amount": 5000,
  "balanceBefore": 0,
  "balanceAfter": 5000,
  "transactionDate": "2026-04-29",
  "notes": "Initial savings deposit",
  "performedBy": "USER_ID",
  "isReversed": false,
  "reversedBy": null,
  "reversedAt": null,
  "createdAt": "2026-04-29T10:00:00.000Z"
}
```

### POST /diary/accounts/:id/withdraw

```bash
curl -X POST "http://localhost:3000/api/v1/diary/accounts/ACCOUNT_ID/withdraw" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "transactionDate": "2026-04-29",
    "notes": "Partial withdrawal"
  }'
```

Expected response: diary transaction object with `type: "withdrawal"`.

### POST /diary/accounts/:id/interest

```bash
curl -X POST "http://localhost:3000/api/v1/diary/accounts/ACCOUNT_ID/interest" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250,
    "transactionDate": "2026-04-29",
    "notes": "Yearly interest"
  }'
```

Expected response: diary transaction object with `type: "interest"`.

## Daily Register Module

### POST /daily-register/days

```bash
curl -X POST "http://localhost:3000/api/v1/daily-register/days" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2026-04-29",
    "notes": "Open day"
  }'
```

Expected response:

```json
{
  "id": "day-uuid",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "entryDate": "2026-04-29",
  "openingBalance": 0,
  "closingBalance": 0,
  "createdBy": "USER_ID",
  "createdAt": "2026-04-29T10:00:00.000Z"
}
```

### GET /daily-register/days

```bash
curl -X GET "http://localhost:3000/api/v1/daily-register/days" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of daily register day objects.

### GET /daily-register/days/:dayId/entries

```bash
curl -X GET "http://localhost:3000/api/v1/daily-register/days/DAY_ID/entries" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of daily register entry objects ordered by `entryTime`.

### POST /daily-register/days/:dayId/entries

```bash
curl -X POST "http://localhost:3000/api/v1/daily-register/days/DAY_ID/entries" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "withdraw": 1000,
    "deposit": 5000,
    "payIn": 200,
    "payOut": 100,
    "recharge": 0,
    "commission": 50,
    "addAmount": 0,
    "remark": "Cash count entry",
    "entryTime": "2026-04-29T10:30:00.000Z"
  }'
```

Expected response:

```json
{
  "id": "entry-uuid",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "registerDayId": "DAY_ID",
  "withdraw": 1000,
  "deposit": 5000,
  "payIn": 200,
  "payOut": 100,
  "recharge": 0,
  "commission": 50,
  "addAmount": 0,
  "balanceAfter": 4150,
  "remark": "Cash count entry",
  "entryTime": "2026-04-29T10:30:00.000Z",
  "createdBy": "USER_ID",
  "updatedBy": null,
  "createdAt": "2026-04-29T10:30:00.000Z",
  "updatedAt": "2026-04-29T10:30:00.000Z"
}
```

### PATCH /daily-register/entries/:id

```bash
curl -X PATCH "http://localhost:3000/api/v1/daily-register/entries/ENTRY_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deposit": 6000,
    "remark": "Adjusted cash count"
  }'
```

Expected response: updated daily register entry object.

### DELETE /daily-register/entries/:id

```bash
curl -X DELETE "http://localhost:3000/api/v1/daily-register/entries/ENTRY_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{}
```

## Udhar Khata Module

### POST /udhar-khata/persons

```bash
curl -X POST "http://localhost:3000/api/v1/udhar-khata/persons" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mohan Lal",
    "phone": "9123456780",
    "address": "Village B"
  }'
```

Expected response:

```json
{
  "id": "person-uuid",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "name": "Mohan Lal",
  "phone": "9123456780",
  "address": "Village B",
  "netBalance": 0,
  "isActive": true,
  "deletedAt": null,
  "createdAt": "2026-04-29T10:00:00.000Z"
}
```

### GET /udhar-khata/persons

```bash
curl -X GET "http://localhost:3000/api/v1/udhar-khata/persons" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of udhar person objects.

### GET /udhar-khata/persons/:id/entries

```bash
curl -X GET "http://localhost:3000/api/v1/udhar-khata/persons/PERSON_ID/entries" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: array of udhar entry objects ordered by `entryDate`.

### POST /udhar-khata/persons/:id/entries

```bash
curl -X POST "http://localhost:3000/api/v1/udhar-khata/persons/PERSON_ID/entries" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "liya",
    "amount": 2000,
    "entryDate": "2026-04-29",
    "remark": "Cash received"
  }'
```

Expected response:

```json
{
  "id": "udhar-entry-uuid",
  "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
  "personId": "PERSON_ID",
  "entryType": "liya",
  "amount": 2000,
  "balanceAfter": 2000,
  "entryDate": "2026-04-29",
  "remark": "Cash received",
  "createdBy": "USER_ID",
  "updatedBy": null,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

### PATCH /udhar-khata/entries/:id

```bash
curl -X PATCH "http://localhost:3000/api/v1/udhar-khata/entries/ENTRY_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "remark": "Updated amount"
  }'
```

Expected response: updated udhar entry object.

### DELETE /udhar-khata/entries/:id

```bash
curl -X DELETE "http://localhost:3000/api/v1/udhar-khata/entries/ENTRY_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{}
```

## Audit Logs Module

### GET /audit-logs

```bash
curl -X GET "http://localhost:3000/api/v1/audit-logs?page=1&limit=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{
  "data": [
    {
      "id": "audit-uuid",
      "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
      "userId": "USER_ID",
      "action": "create",
      "tableName": "loans",
      "recordId": "loan-uuid",
      "oldData": null,
      "newData": {},
      "ipAddress": "127.0.0.1",
      "userAgent": "curl/8.0",
      "createdAt": "2026-04-29T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

## Files Module

All files routes require `Authorization: Bearer <accessToken>`.

### POST /files/upload

```bash
curl -X POST "http://localhost:3000/api/v1/files/upload" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "files=@/path/to/aadhar.jpg" \
  -F "files=@/path/to/pan.jpg" \
  -F "documentType=kyc_document" \
  -F "description=Customer KYC files"
```

Expected response:

```json
{
  "success": true,
  "data": [
    {
      "id": "file-uuid",
      "customerId": "CUSTOMER_ID",
      "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
      "originalFileName": "aadhar.jpg",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "image/jpeg",
      "fileSize": 203456,
      "documentType": "kyc_document",
      "description": "Customer KYC files",
      "uploadedAt": "2026-04-29T10:00:00.000Z"
    }
  ]
}
```

### GET /files/:fileId

```bash
curl -X GET "http://localhost:3000/api/v1/files/FILE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "customerId": "CUSTOMER_ID",
    "centreId": "2f7a1f8c-3d40-4d8f-8d27-7d4d4c2f2b11",
    "originalFileName": "aadhar.jpg",
    "fileUrl": "https://res.cloudinary.com/...",
    "mimeType": "image/jpeg",
    "fileSize": 203456,
    "documentType": "kyc_document",
    "description": "Customer KYC files",
    "uploadedAt": "2026-04-29T10:00:00.000Z"
  }
}
```

### GET /files/customer/my-files

```bash
curl -X GET "http://localhost:3000/api/v1/files/customer/my-files" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: `{ "success": true, "data": [ ...FileResponseDto ] }`

### GET /files/by-type/:documentType

```bash
curl -X GET "http://localhost:3000/api/v1/files/by-type/kyc_document" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response: `{ "success": true, "data": [ ...FileResponseDto ] }`

### DELETE /files/:fileId

```bash
curl -X DELETE "http://localhost:3000/api/v1/files/FILE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### DELETE /files/delete-all/permanent

```bash
curl -X DELETE "http://localhost:3000/api/v1/files/delete-all/permanent" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:

```json
{
  "success": true,
  "message": "Deleted 2 file(s) for customer",
  "deletedCount": 2
}
```

## Internal Modules

- `sequences` and `mail` are internal/support modules and do not expose public HTTP endpoints.

## Notes

- All monetary values are rounded to 2 decimals in responses.
- Protected routes rely on JWT plus centre isolation guards.
- Some endpoints return raw entity arrays, so the exact shape matches the entity fields shown above.