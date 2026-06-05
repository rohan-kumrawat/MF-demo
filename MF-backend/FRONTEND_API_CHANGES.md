# 📋 API Changes — Frontend Developer Reference

> **Base URL:** `https://gurukripa.duckdns.org/api/v1`
> **Auth:** Bearer token (JWT) — sabhi endpoints par `Authorization: Bearer <token>` header required hai
> **Last Updated:** 2026-05-03

---

## 1. 📒 Diary — Multiple Diaries Per Customer

### Kya badla?
Pehle ek customer ki sirf ek diary ban sakti thi. Ab **ek customer multiple diaries** bana sakta hai. Har diary ka ek **naam** aur **unique code** hoga.

---

### 1.1 Diary Account Create

**`POST /diary/accounts`**
> Roles: `ADMIN`, `AGENT`

#### Request Body
```json
{
  "customerId": "uuid",
  "diaryName": "Savings 2025"   // ← NEW (optional, default: "Default")
}
```

#### Response (naye fields highlighted)
```json
{
  "id": "uuid",
  "centreId": "uuid",
  "customerId": "uuid",
  "diaryName": "Savings 2025",         // ← NEW
  "accountCode": "KCSC-DA00001",       // ← NEW — unique code (BHOINDA: KCSC-DA, DHARAMRAY: GK-DA)
  "balance": 0,
  "cycleStartDate": null,
  "lastWithdrawalDate": null,
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 1.2 Diary Accounts List & Single Account

**`GET /diary/accounts`** — sabhi accounts
**`GET /diary/accounts/:id`** — single account

Response mein ab `diaryName` aur `accountCode` fields bhi aayenge.

---

### 1.3 Diary Account — Opening Balance (NEW)

**`POST /diary/accounts`** — `openingBalance` field ab optional add kar sakte ho

#### Request Body
```json
{
  "customerId": "uuid",
  "diaryName": "Savings 2025",
  "openingBalance": 5000.00    // ← NEW (optional)
}
```

#### Kya hota hai?
- Agar `openingBalance` diya → automatically ek **DEPOSIT** transaction create hogi aaj ki date se
- Transaction ki `notes` mein `"Opening balance"` likha hoga
- Account ka `balance` turant set ho jaata hai
- Agar nahi diya → balance 0 se start hoga (pehle jaisa)

---

## 2. 📗 Udhar Khata — Unique Person Code & Opening Balance

### Kya badla?
Udhar Khata mein jab naya person create hoga, ab uska ek **unique code** generate hoga.

---

### 2.1 Person Create

**`POST /udhar-khata/persons`**
> Roles: `ADMIN`, `AGENT`

#### Request Body
```json
{
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "address": "Village XYZ",
  "openingBalance": 2000,            // ← NEW (optional)
  "openingBalanceType": "diya"       // ← NEW (required if openingBalance > 0)
}
```

> `openingBalanceType` values:
> - `"diya"` → humne unhe paise diye (person hamare liye liable hai — positive netBalance)
> - `"liya"` → unhone humein paise diye (hum unke liye liable hain — negative netBalance)

#### Response (naye fields)
```json
{
  "id": "uuid",
  "centreId": "uuid",
  "name": "Ramesh Kumar",
  "personCode": "KCSC-UK00001",    // ← NEW — unique code
  "phone": "9876543210",
  "netBalance": 2000,              // ← opening balance se set
  "isActive": true,
  "createdAt": "..."
}
```

#### Kya hota hai?
- Agar `openingBalance` diya → automatically ek initial entry create hoti hai aaj ki date se
- Entry ki `remark` mein `"Opening balance"` likha hoga
- `netBalance` turant calculate ho jaata hai


---

### Unique Code Patterns

| Centre | Diary Code | Udhar Khata Code |
|--------|-----------|-----------------|
| BHOINDA | `KCSC-DA00001` | `KCSC-UK00001` |
| DHARAMRAY | `GK-DA00001` | `GK-UK00001` |

---

## 3. ✏️ Diary Transactions — Edit & Delete (NEW APIs)

### 3.1 Transaction Edit

**`PATCH /diary/accounts/:accountId/transactions/:txId`**
> Roles: `ADMIN` only

Koi bhi ek ya sabhi fields bhejo:

#### Request Body
```json
{
  "amount": 500,
  "transactionDate": "2026-05-01",
  "notes": "Corrected entry"
}
```

#### Response
Updated transaction object return hoga. `balanceBefore` aur `balanceAfter` automatically recalculate hoge.

#### Important Rules
- Reversed transactions edit nahi ho sakti (400 error)
- `LOAN_ADJUSTMENT` type ki transactions edit nahi hoti (loan reverse karo uske liye)

---

### 3.2 Transaction Delete

**`DELETE /diary/accounts/:accountId/transactions/:txId`**
> Roles: `ADMIN` only

#### Response
```json
{
  "message": "Transaction deleted and balances recalculated"
}
```

#### Important Rules
- Transaction permanently delete hoti hai (soft delete nahi)
- Delete ke baad account ka `balance` aur sabhi baad ki transactions ke `balanceBefore`/`balanceAfter` automatically recalculate hote hain
- Reversed transactions delete nahi ho sakti

---

## 4. ✏️ Loan Transactions — Edit & Delete (NEW APIs)

### 4.1 Transaction Edit

**`PATCH /loans/:loanId/transactions/:txId`**
> Roles: `ADMIN` only

#### Request Body
```json
{
  "amount": 2500,
  "paymentDate": "2026-05-01",
  "paymentMode": "upi",
  "notes": "Corrected payment"
}
```
> `paymentMode` values: `cash` | `upi` | `bank`

#### Response
Updated loan transaction object. Loan ka `totalPaid` aur `remainingBalance` automatically recalculate hoga.

#### Important Rules
- Transaction `type` (EMI/PENALTY/OTHER) edit nahi ho sakta
- Reversed transactions edit nahi hoti
- Amount change hone par `principalPart`/`interestPart`/`penaltyPart` auto-recalculate hote hain

---

### 4.2 Transaction Delete

**`DELETE /loans/:loanId/transactions/:txId`**
> Roles: `ADMIN` only

#### Response
```json
{
  "message": "Transaction deleted and loan balances recalculated"
}
```

#### Important Rules
- Transaction permanently delete hoti hai
- Loan ka `totalPaid`, `remainingBalance` automatically recalculate hoga
- Agar loan delete ke baad puri tarah unpaid ho jaaye to **loan automatically ACTIVE** ho jaata hai (reopen)
- Agar transaction mein diary deduction linked tha (`diaryAmount > 0`) to diary ka balance automatically **refund** ho jaata hai
- Reversed transactions delete nahi hoti

---

## 5. 🔄 Existing APIs — Unchanged

Ye APIs exactly pehle jaisi hain, koi change nahi:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/diary/accounts/:id/deposit` | POST | Deposit karo |
| `/diary/accounts/:id/withdraw` | POST | Withdrawal karo |
| `/diary/accounts/:id/interest` | POST | Interest add karo |
| `/diary/accounts/:id/transactions` | GET | Transactions list |
| `/loans/:id/transactions` | POST | Payment add karo |
| `/loans/:id/transactions/:txId/reverse` | PATCH | Transaction reverse karo (soft) |
| `/loans/:id/pre-close` | POST | Loan pre-close karo |

---

## 6. 📌 Frontend UI Suggestions

### Diary
- Account list mein **`accountCode`** display karo (jaise loan number)
- Account create form mein optional **"Diary Name"** input field add karo
- Transaction list mein `ADMIN` role ke liye **Edit** ✏️ aur **Delete** 🗑️ buttons dikhao
- Delete se pehle **confirmation dialog** dikhao: *"Ye transaction permanently delete ho jayegi aur balance recalculate hoga"*

### Loans
- Transaction list mein `ADMIN` role ke liye **Edit** ✏️ aur **Delete** 🗑️ buttons dikhao
- Edit modal mein `type` field **disabled** rakho (editable nahi hai)
- Delete se pehle **confirmation dialog** dikhao
- Agar transaction mein `diaryAmount > 0` tha, delete confirmation mein mention karo: *"Diary balance ₹{diaryAmount} refund ho jayega"*

### Udhar Khata
- Person list mein **`personCode`** display karo

---

## 7. 🚨 Error Responses

| Status | Kab aata hai |
|--------|-------------|
| `400 Bad Request` | Reversed transaction edit/delete karne par |
| `400 Bad Request` | LOAN_ADJUSTMENT diary tx edit karne par |
| `403 Forbidden` | ADMIN ke alawa koi edit/delete kare |
| `404 Not Found` | Transaction ya Account ID galat ho |

```json
// Error response format
{
  "statusCode": 400,
  "message": "Cannot edit a reversed transaction"
}
```

---

## 8. 👤 Customer — Nominee Fields (NEW)

### Kya badla?
Customer create aur update karte waqt ab **Nominee Name** aur **Nominee Relation** bhi daal sakte hain.

---

### 8.1 Customer Create

**`POST /users`**
> Roles: `ADMIN`

#### Request Body (naye fields highlighted)
```json
{
  "username": "ramesh01",
  "password": "pass123",
  "role": "customer",
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "address": "Village XYZ",
  "fatherHusbandName": "Suresh Kumar",
  "aadharNumber": "1234-5678-9012",
  "memberSince": "2026-01-01",
  "accountName": "Ramesh Kumar",
  "nomineeName": "Sita Devi",         // ← NEW (optional)
  "nomineeRelation": "Wife"           // ← NEW (optional)
}
```

> **`nomineeRelation`** ke liye koi fixed values nahi hain — jo bhi text dena ho daal sakte ho:
> e.g. `"Wife"`, `"Husband"`, `"Son"`, `"Daughter"`, `"Father"`, `"Mother"`, `"Brother"`, `"Sister"`

---

### 8.2 Customer Update

**`PATCH /users/:id`**
> Roles: `ADMIN`

Baad mein bhi nominee update kar sakte hain:

```json
{
  "nomineeName": "Ramesh Kumar Jr.",
  "nomineeRelation": "Son"
}
```

---

### 8.3 Response mein naye fields

Sabhi user/customer GET responses mein ab ye fields aayenge:

```json
{
  "id": "uuid",
  "name": "Ramesh Kumar",
  "customerCode": "CTST-00001",
  "nomineeName": "Sita Devi",        // ← NEW (null agar nahi diya)
  "nomineeRelation": "Wife",          // ← NEW (null agar nahi diya)
  ...
}
```

### Lightsail Deploy
```bash
git pull && pm2 restart all
```
> Koi migration nahi chahiye — TypeORM automatically `nomineeName` aur `nomineeRelation` columns add kar dega.

---

## 9. 📊 Reports Module (NEW)

### 9.1 Agent Collections

**`GET /reports/collections`**
> Roles: `ADMIN`, `AGENT`
> AGENT apna sirf khud ka data dekh sakta hai.

#### Query Params

| Param | Type | Description |
|-------|------|-------------|
| `period` | `day` \| `week` \| `month` | Preset range (default: `day` = aaj) |
| `from` | `YYYY-MM-DD` | Custom range start |
| `to` | `YYYY-MM-DD` | Custom range end |
| `agentId` | UUID | Specific agent filter (ADMIN only) |

#### Examples
```
GET /reports/collections                              → aaj sabhi agents
GET /reports/collections?period=week                 → is hafte
GET /reports/collections?period=month                → is mahine
GET /reports/collections?from=2026-04-01&to=2026-04-30  → custom range
GET /reports/collections?period=day&agentId=<uuid>   → aaj ek agent
```

#### Response
```json
{
  "period": "Today",
  "from": "2026-05-03",
  "to": "2026-05-03",
  "grandTotal": 15000.00,
  "totalTransactions": 8,
  "agents": [
    {
      "agentId": "uuid",
      "agentName": "Mohan Sharma",
      "totalCollected": 10000.00,
      "emiCount": 5,
      "penaltyCount": 1,
      "otherCount": 0,
      "principalCollected": 8000.00,
      "interestCollected": 1800.00,
      "penaltyCollected": 200.00,
      "transactions": [
        {
          "id": "uuid",
          "loanId": "uuid",
          "loanAccountNumber": "LOAN-CTST-00001",
          "type": "emi",
          "amount": 2000.00,
          "principalPart": 1600.00,
          "interestPart": 400.00,
          "penaltyPart": 0,
          "paymentDate": "2026-05-03",
          "receiptNo": "RCP-...",
          "paymentMode": "cash"
        }
      ]
    }
  ]
}
```

---

### 9.2 Agent Day-Wise Breakdown

**`GET /reports/collections/agent/:agentId/day-wise`**
> Roles: `ADMIN`, `AGENT`

#### Query Params
| Param | Type | Description |
|-------|------|-------------|
| `days` | number | Last N days (default: 30) |
| `from` | `YYYY-MM-DD` | Custom range start |
| `to` | `YYYY-MM-DD` | Custom range end |

#### Response
```json
{
  "agent": { "id": "uuid", "name": "Mohan Sharma", "phone": "9876543210" },
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

---

### 9.3 Centre Summary (Leaderboard)

**`GET /reports/summary`**
> Roles: `ADMIN` only

Sabhi agents ki collection ek period mein — highest se lowest sorted.

#### Query Params: same as `/collections` (period / from / to)

#### Response
```json
{
  "period": "This Month",
  "from": "2026-05-01",
  "to": "2026-05-31",
  "grandTotal": 125000.00,
  "totalTransactions": 62,
  "byAgent": [
    { "agentId": "uuid", "agentName": "Mohan Sharma", "txCount": 30, "totalCollected": 75000.00 },
    { "agentId": "uuid", "agentName": "Ramesh Singh", "txCount": 32, "totalCollected": 50000.00 }
  ]
}
```


