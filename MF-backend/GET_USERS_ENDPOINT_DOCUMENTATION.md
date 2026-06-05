# GET /api/v1/users - Users List Endpoint Documentation

## Endpoint Overview
Retrieve a paginated list of users filtered by role from a specific centre. This endpoint is protected and only accessible to ADMIN and AGENT roles.

---

## Request Details

### HTTP Method & URL
```
GET /api/v1/users
```

### Base URL
```
https://api.gurukripaconnect.top/api/v1/users
```

---

## Authentication & Authorization

### Required Authentication
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Guard**: JwtAuthGuard (applied at controller level)

### JWT Token Payload Example
```json
{
  "sub": "2ff9c168-57c7-42ad-a355-ce41e4151c2dd",
  "centreId": "2a8ef726-05e6-4722-b7a7-3b5b6b9bb1bb",
  "role": "admin",
  "type": "access",
  "diaryIds": [],
  "loanIds": [],
  "iat": 1778060143,
  "exp": 1778060143
}
```

### Authorized Roles
- **ADMIN** ✓
- **AGENT** ✓
- **CUSTOMER** ✗ (Forbidden)
- **KIOSK** ✗ (Forbidden)

### Security Guards Applied
1. **JwtAuthGuard** - Validates JWT token
2. **CentreIsolationGuard** - Ensures user can only access data from their centre
3. **RolesGuard** - Validates that user has ADMIN or AGENT role

---

## Query Parameters

### Available Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `role` | string (enum) | No | - | Filter users by role. Valid values: `admin`, `agent`, `customer`, `kiosk` |
| `page` | number | No | 1 | Page number for pagination (1-indexed) |
| `limit` | number | No | 50 | Number of records per page (max: 50) |

### Query Parameter Examples

```bash
# Get all customers
?role=customer

# Get customers with pagination
?role=customer&page=2&limit=25

# Get all users (no role filter) with pagination
?page=1&limit=100

# Get admins only
?role=admin
```

---

## Request Headers

### Required Headers
| Header | Value | Description |
|--------|-------|-------------|
| `Authorization` | `Bearer <JWT_TOKEN>` | JWT authentication token |

### Recommended Headers
| Header | Example Value | Description |
|--------|---------------|-------------|
| `accept` | `application/json` | Expected response format |
| `accept-language` | `en-US,en;q=0.9` | Preferred language |
| `content-type` | `application/json` | (For POST/PATCH) Content type of request body |



---

## Filters & Constraints

### Applied Filters (Automatic)

All responses are automatically filtered by:

1. **Centre Isolation**: Only returns users belonging to the requester's centre (from JWT token)
2. **Soft Deletion**: Excludes users with `deletedAt` is NOT NULL
3. **Role Filter** (Optional): If role query parameter is provided, only users with that role are returned

### Filter Logic (in code)
```typescript
where: {
  centreId: user.centreId,        // From JWT token
  deletedAt: IsNull(),             // Active users only
  role: role                       // Optional role filter
}
```

---

## Response Format

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| **200** | OK | Request successful, users returned |
| **401** | Unauthorized | Invalid or missing JWT token |
| **403** | Forbidden | User lacks required role (not ADMIN/AGENT) |
| **400** | Bad Request | Invalid query parameters |

### Response Type
`application/json`

### Response Schema

```typescript
{
  "data": [
    {
      "id": "uuid",
      "centreId": "uuid",
      "username": "string",
      "role": "admin" | "agent" | "customer" | "kiosk",
      "name": "string",
      "phone": "string | null",
      "address": "string | null",
      "email": "string | null",
      "customerCode": "string | null",
      "fatherHusbandName": "string | null",
      "aadharNumber": "string | null",
      "memberSince": "date | null",
      "nomineeName": "string | null",
      "nomineeRelation": "string | null",
      "isActive": boolean,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

### Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `data` | Array | Array of user objects |
| `total` | number | Total count of matching users |
| `page` | number | Current page number (1-indexed) |
| `limit` | number | Records per page |

### User Object Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Unique user identifier |
| `centreId` | UUID | No | Associated centre ID |
| `username` | string | No | Unique username (per centre) |
| `role` | enum | No | User role: admin, agent, customer, kiosk |
| `name` | string | No | User's full name |
| `phone` | string | Yes | Phone number (for customers) |
| `address` | string | Yes | Physical address (for customers) |
| `email` | string | Yes | Email address (unique per centre) |
| `customerCode` | string | Yes | Auto-generated code for customers only |
| `fatherHusbandName` | string | Yes | KYC field - Father/Husband name (customers) |
| `aadharNumber` | string | Yes | KYC field - Aadhar number (customers) |
| `memberSince` | date | Yes | KYC field - Membership date (customers) |
| `nomineeName` | string | Yes | KYC field - Nominee name (customers) |
| `nomineeRelation` | string | Yes | KYC field - Nominee relation (customers) |
| `isActive` | boolean | No | Whether user account is active |
| `createdAt` | timestamp | No | User creation timestamp |
| `updatedAt` | timestamp | No | Last update timestamp |

---

## Request Examples

### 1. Get All Customers (Paginated)
```bash
curl 'https://api.gurukripaconnect.top/api/v1/users?role=customer&page=1&limit=20' \
  -H 'accept: application/json' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 2. Get All Active Users (No Filter)
```bash
curl 'https://api.gurukripaconnect.top/api/v1/users?page=1&limit=50' \
  -H 'accept: application/json' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 3. Get Agents Only
```bash
curl 'https://api.gurukripaconnect.top/api/v1/users?role=agent' \
  -H 'accept: application/json' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 4. With Custom Pagination
```bash
curl 'https://api.gurukripaconnect.top/api/v1/users?role=customer&page=3&limit=25' \
  -H 'accept: application/json' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## Response Examples

### Successful Response (200 OK)
```json
{
  "data": [
    {
      "id": "3b4c5d6e-7f8g-9h0i-j1k2-l3m4n5o6p7q8",
      "centreId": "2a8ef726-05e6-4722-b7a7-3b5b6b9bb1bb",
      "username": "rajesh_patel",
      "role": "customer",
      "name": "Rajesh Patel",
      "phone": "9876543210",
      "address": "123 Main Street, Mumbai",
      "email": "rajesh@example.com",
      "customerCode": "CUST001",
      "fatherHusbandName": "Ram Patel",
      "aadharNumber": "1234567890123",
      "memberSince": "2023-05-15",
      "nomineeName": "Priya Patel",
      "nomineeRelation": "Wife",
      "isActive": true,
      "createdAt": "2023-05-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    },
    {
      "id": "4c5d6e7f-8g9h-0i1j-k2l3-m4n5o6p7q8r9",
      "centreId": "2a8ef726-05e6-4722-b7a7-3b5b6b9bb1bb",
      "username": "amit_sharma",
      "role": "customer",
      "name": "Amit Sharma",
      "phone": "9876543211",
      "address": "456 Oak Lane, Delhi",
      "email": "amit@example.com",
      "customerCode": "CUST002",
      "fatherHusbandName": "Mohan Sharma",
      "aadharNumber": "1234567890124",
      "memberSince": "2023-06-20",
      "nomineeName": "Neha Sharma",
      "nomineeRelation": "Wife",
      "isActive": true,
      "createdAt": "2023-06-20T09:15:00Z",
      "updatedAt": "2024-02-01T11:20:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### Error Response - Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### Error Response - Forbidden (403)
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "You do not have permission to access this resource"
}
```

---

## Data Filtering Logic

### How Centre Isolation Works
The endpoint automatically filters users based on the requester's `centreId` from the JWT token:
```typescript
where: {
  centreId: user.centreId  // Only users from the same centre
}
```

### Soft Deletion Filter
Deleted users are excluded:
```typescript
where: {
  deletedAt: IsNull()  // Only active (non-deleted) users
}
```

### Role-Based Filtering
When `?role=customer` is provided:
```typescript
where: {
  role: 'customer'  // Only customers
}
```

### Sorting
Results are sorted by creation date (newest first):
```typescript
order: { createdAt: 'DESC' }
```

---

## Pagination Details

### Default Behavior
- **Default Page**: 1 (first page)
- **Default Limit**: 50 records
- **Skip Calculation**: `(page - 1) * limit`

### Pagination Formula
```
Offset = (page - 1) * limit
```

### Example
For `page=2&limit=25`:
- Skip: `(2-1) * 25 = 25` records
- Fetch: next 25 records (records 26-50)

---

## Code Reference

### Controller Method
**File**: [src/modules/users/users.controller.ts](src/modules/users/users.controller.ts#L36-L49)

```typescript
@Get()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.AGENT)
findAll(
  @CurrentUser() user: any,
  @Query('role')  role?  : Role,
  @Query('page')  page?  : string,
  @Query('limit') limit? : string,
) {
  return this.usersService.findAll(
    user.centreId,
    role,
    page  ? parseInt(page,  10) : 1,
    limit ? parseInt(limit, 10) : 50,
  );
}
```

### Service Method
**File**: [src/modules/users/users.service.ts](src/modules/users/users.service.ts#L52-L66)

```typescript
async findAll(centreId: string, role?: Role, page = 1, limit = 50) {
  const where: any = { centreId, deletedAt: IsNull() };
  if (role) where.role = role;
  const [users, total] = await this.repo.findAndCount({
    where,
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
  return { data: users, total, page, limit };
}
```

### Entity Definition
**File**: [src/modules/users/entities/user.entity.ts](src/modules/users/entities/user.entity.ts)

---

## Related Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users` | Create a new user |
| GET | `/api/v1/users/:id` | Get a specific user by ID |
| PATCH | `/api/v1/users/:id` | Update user details |
| DELETE | `/api/v1/users/:id` | Soft delete a user |
| GET | `/api/v1/users/customers/search` | Search customers by name |

---

## Common Use Cases

### 1. Get all customers for a centre
```
GET /api/v1/users?role=customer
```
Returns all customers from the requester's centre, paginated.

### 2. Get active agents
```
GET /api/v1/users?role=agent&page=1&limit=100
```
Returns all agents with up to 100 records per page.

### 3. Implement infinite scroll
```
GET /api/v1/users?role=customer&page=1&limit=20  # Load first 20
GET /api/v1/users?role=customer&page=2&limit=20  # Load next 20
GET /api/v1/users?role=customer&page=3&limit=20  # Load next 20
```

### 4. Check if more records exist
Check if `data.length < limit` or compare current items with `total`

---

## Notes & Best Practices

1. **Always include Authorization header** - This endpoint requires JWT authentication
2. **Role filter is optional** - Omit `role` parameter to get all users
3. **Centre isolation is automatic** - Users can only see data from their centre
4. **Pagination is strongly recommended** - Large datasets should use appropriate page/limit
5. **Soft deletion** - Deleted users (with deletedAt set) are automatically excluded
6. **Cache control** - Use `if-none-match` header with ETag for performance
7. **Cross-origin requests** - This endpoint supports CORS for frontend applications

---

## Troubleshooting

### 401 Unauthorized
- Check if JWT token is valid and not expired
- Ensure `Authorization: Bearer <token>` format is correct

### 403 Forbidden
- Verify user role is ADMIN or AGENT
- Check if user's role is not CUSTOMER or KIOSK

### Empty Results
- Verify that users exist in the same centre
- Check if all users have been soft-deleted
- Ensure `role` filter matches actual user roles

### Pagination Issues
- Page numbering starts at 1 (not 0)
- Default limit is 50 if not specified
- Check total count against current page/limit to avoid empty pages

---

**Last Updated**: 2026-05-06  
**API Version**: v1  
**Environment**: Production (api.gurukripaconnect.top)
