# Diary Account Delete API

This API deletes an entire diary account for a user while keeping historical ledger data available for audit and reporting.

## Endpoint

**Method:** `DELETE`  
**Path:** `/api/v1/diary/accounts/:id`  
**Auth:** Bearer JWT  
**Role:** `ADMIN`

## Behavior

1. Validate that the diary account belongs to the caller's centre.
2. Load the account only if it is still active.
3. Soft-delete the account by setting:
   - `isActive = false`
   - `deletedAt = now`
4. Keep all diary transactions in the database for audit and reporting history.

## Response

```json
{
  "message": "Diary account deleted successfully"
}
```

## Error Cases

- `404 Not Found` — diary account does not exist or is already deleted.
- `403 Forbidden` — user is not allowed to access the account.

## Notes

- This is a soft delete, not a physical purge.
- Active APIs and reports must exclude deleted accounts.
- If a permanent purge is required, add a separate archival job after compliance review.