# 🔄 Backend API Changes — Frontend Developer Guide

> **Base URL:** `https://api.gurukripaconnect.top/api/v1`
> **Date:** 2026-05-03
> **Auth:** Har request mein `Authorization: Bearer <token>` header bhejna zaroori hai.

---

## ⚡ CRITICAL — Pagination Changes (GET /users)

`GET /users` API ab plain array return nahi karti, balki ek paginated object return karti hai. Frontend ke sabhi services (customers, agents, kiosk) ko isi format ko handle karna hoga.

### GET /users (Paginated)
**Description:** Get all users/customers/agents with pagination.
**cURL Example:**
```bash
curl -X GET 'https://api.gurukripaconnect.top/api/v1/users?role=customer&page=1&limit=50' \
-H 'Authorization: Bearer <your_token>'
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "...",
      "name": "Ramesh Kumar",
      "customerCode": "CTST-00001",
      "role": "customer",
      "phone": "9876543210",
      "nomineeName": "Sita Devi",
      "nomineeRelation": "Wife",
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```
**Frontend Fix:** Ab `.map()` ya `.filter()` chalane se pehle `response.data.data` access karna hoga (instead of just `response.data`).

---

## 1. 📒 Diary — Multiple Diaries Per Customer

Ek customer ki ab multiple diaries ho sakti hain.

### 1.1 Create Diary Account
**Description:** Create a new diary, optionally with a starting balance and custom name.
**cURL Example:**
```bash
curl -X POST 'https://api.gurukripaconnect.top/api/v1/diary/accounts' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your_token>' \
-d '{
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "diaryName": "Savings 2025",
  "openingBalance": 5000.00
}'
```

**Expected Response (201 Created):**
```json
{
  "id": "...",
  "customerId": "...",
  "diaryName": "Savings 2025",
  "accountCode": "KCSC-DA00001",
  "balance": 5000.00,
  "isActive": true
}
```

### 1.2 Edit Diary Transaction (ADMIN Only)
**Description:** Edit an existing deposit/withdraw/interest transaction.
**cURL Example:**
```bash
curl -X PATCH 'https://api.gurukripaconnect.top/api/v1/diary/accounts/<accountId>/transactions/<txId>' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your_token>' \
-d '{
  "amount": 500,
  "transactionDate": "2026-05-01",
  "notes": "Corrected entry"
}'
```

**Expected Response (200 OK):**
```json
{
  "id": "...",
  "type": "deposit",
  "amount": 500,
  "balanceBefore": 0,
  "balanceAfter": 500,
  "transactionDate": "2026-05-01",
  "notes": "Corrected entry"
}
```

### 1.3 Delete Diary Transaction (ADMIN Only)
**Description:** Permanently delete a transaction. Balances will auto-recalculate.
**cURL Example:**
```bash
curl -X DELETE 'https://api.gurukripaconnect.top/api/v1/diary/accounts/<accountId>/transactions/<txId>' \
-H 'Authorization: Bearer <your_token>'
```

**Expected Response (200 OK):**
```json
{
  "message": "Transaction deleted and balances recalculated"
}
```

---

## 2. 📗 Udhar Khata — Unique Code & Opening Balance

### 2.1 Create Udhar Khata Person
**Description:** Add a person with an optional opening balance.
**cURL Example:**
```bash
curl -X POST 'https://api.gurukripaconnect.top/api/v1/udhar-khata/persons' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your_token>' \
-d '{
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "address": "Village XYZ",
  "openingBalance": 2000,
  "openingBalanceType": "diya"
}'
```
> `openingBalanceType`: `"diya"` (positive netBalance) ya `"liya"` (negative netBalance)

**Expected Response (201 Created):**
```json
{
  "id": "...",
  "name": "Ramesh Kumar",
  "personCode": "KCSC-UK00001",
  "netBalance": 2000,
  "isActive": true
}
```

---

## 3. 💰 Loan Transactions — Edit & Delete

### 3.1 Edit Loan Transaction (ADMIN Only)
**Description:** Update a loan payment. `type` cannot be changed.
**cURL Example:**
```bash
curl -X PATCH 'https://api.gurukripaconnect.top/api/v1/loans/<loanId>/transactions/<txId>' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your_token>' \
-d '{
  "amount": 2500,
  "paymentDate": "2026-05-01",
  "paymentMode": "upi",
  "notes": "Corrected payment"
}'
```

**Expected Response (200 OK):**
```json
{
  "id": "...",
  "type": "emi",
  "amount": 2500,
  "principalPart": 2000,
  "interestPart": 500,
  "paymentMode": "upi"
}
```

### 3.2 Delete Loan Transaction (ADMIN Only)
**Description:** Delete a loan payment. Loan balances will auto-recalculate.
**cURL Example:**
```bash
curl -X DELETE 'https://api.gurukripaconnect.top/api/v1/loans/<loanId>/transactions/<txId>' \
-H 'Authorization: Bearer <your_token>'
```

**Expected Response (200 OK):**
```json
{
  "message": "Transaction deleted and loan balances recalculated"
}
```

---

## 4. 👤 Customer — Nominee Fields

### 4.1 Create/Update Customer
**Description:** Ab customer banate time nominee details add kar sakte hain.
**cURL Example:**
```bash
curl -X POST 'https://api.gurukripaconnect.top/api/v1/users' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your_token>' \
-d '{
  "username": "ramesh01",
  "password": "pass123",
  "role": "customer",
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "nomineeName": "Sita Devi",
  "nomineeRelation": "Wife"
}'
```

**Expected Response (201 Created):**
```json
{
  "id": "...",
  "username": "ramesh01",
  "name": "Ramesh Kumar",
  "customerCode": "CTST-00001",
  "nomineeName": "Sita Devi",
  "nomineeRelation": "Wife",
  "role": "customer"
}
```

---

## 5. 📊 Reports Module (New APIs)

### 5.1 Agent Collections
**Description:** Get collection data grouped by agent.
**cURL Example:**
```bash
curl -X GET 'https://api.gurukripaconnect.top/api/v1/reports/collections?period=day' \
-H 'Authorization: Bearer <your_token>'
```

**Expected Response (200 OK):**
```json
{
  "period": "Today",
  "from": "2026-05-03",
  "to": "2026-05-03",
  "grandTotal": 15000.00,
  "totalTransactions": 8,
  "agents": [
    {
      "agentId": "...",
      "agentName": "Mohan Sharma",
      "totalCollected": 10000.00,
      "emiCount": 5,
      "penaltyCount": 1,
      "otherCount": 0,
      "principalCollected": 8000.00,
      "interestCollected": 1800.00,
      "penaltyCollected": 200.00,
      "transactions": [ ... ]
    }
  ]
}
```

### 5.2 Agent Day-Wise Breakdown
**Description:** Get a single agent's collections day-by-day.
**cURL Example:**
```bash
curl -X GET 'https://api.gurukripaconnect.top/api/v1/reports/collections/agent/<agentId>/day-wise?days=30' \
-H 'Authorization: Bearer <your_token>'
```

**Expected Response (200 OK):**
```json
{
  "agent": { "id": "...", "name": "Mohan Sharma", "phone": "9876543210" },
  "from": "2026-04-03",
  "to": "2026-05-03",
  "grandTotal": 45000.00,
  "totalTransactions": 22,
  "dayWise": [
    {
      "date": "2026-04-03",
      "txCount": 3,
      "totalAmount": 6000.00,
      "principalAmount": 4800.00,
      "interestAmount": 1200.00,
      "penaltyAmount": 0.00
    }
  ]
}
```

### 5.3 Centre Summary (Leaderboard)
**Description:** See who collected the most across the centre.
**cURL Example:**
```bash
curl -X GET 'https://api.gurukripaconnect.top/api/v1/reports/summary?period=month' \
-H 'Authorization: Bearer <your_token>'
```

**Expected Response (200 OK):**
```json
{
  "period": "This Month",
  "from": "2026-05-01",
  "to": "2026-05-31",
  "grandTotal": 125000.00,
  "totalTransactions": 62,
  "byAgent": [
    { "agentId": "...", "agentName": "Mohan Sharma", "txCount": 30, "totalCollected": 75000.00 },
    { "agentId": "...", "agentName": "Ramesh Singh", "txCount": 32, "totalCollected": 50000.00 }
  ]
}
```

---

## 🚨 Standard Error Response
Jab bhi koi error aayega (like validation failure, or bad request), backend humesha is standard format mein error dega:

```json
{
  "statusCode": 400,
  "message": "Cannot edit a reversed transaction",
  "errors": [
    {
      "field": "amount",
      "message": "must be a positive number"
    }
  ]
}
```
