# Update User API Documentation

This documentation describes how to use the `PATCH /api/v1/users/:id` endpoint to update user information.

## Endpoint
**URL:** `/api/v1/users/:id`  
**Method:** `PATCH`  
**Auth Required:** Bearer Token (JWT)

## Permissions
- **Admin:** Can update any user's profile in their centre.
- **Agent/Customer:** Can only update their **own** profile.
- **Note:** Only Admins (or higher roles) can modify the `isActive` status.

## Request Payload (JSON)

All fields are optional. Only include the fields you want to update.

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | string | Full name of the user | Min 2 characters |
| `phone` | string | Contact number | |
| `address` | string | Residential address | |
| `fatherHusbandName` | string | KYC Detail: Father or Husband's name | |
| `aadharNumber` | string | KYC Detail: 12-digit Aadhar number | |
| `accountName` | string | KYC Detail: Bank account holder name | |
| `memberSince` | string | Membership start date | ISO Date string (e.g., `2024-05-04`) |
| `nomineeName` | string | KYC Detail: Nominee for the account | |
| `nomineeRelation` | string | KYC Detail: Relation with nominee | e.g., Wife, Son, Brother |
| `isActive` | boolean | Toggle user active status | Restricted to Admin |

### Fields that CANNOT be updated
The following fields are immutable or handled by other endpoints:
- `username`: Cannot be changed once created.
- `role`: Cannot be changed via this endpoint.
- `password`: Handled via dedicated security endpoints.

## Example Request (Frontend/Axios)

```javascript
const updateUserData = {
  name: "Rohan Kumrawat",
  phone: "8120675025",
  address: "Bhoinda",
  aadharNumber: "998877665522",
  fatherHusbandName: "Balkrishna Kumrawat",
  memberSince: "2026-05-04",
  nomineeName: "Rahul Kumrawat",
  nomineeRelation: "Brother"
};

try {
  const response = await axios.patch(`/api/v1/users/${userId}`, updateUserData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  console.log('Update successful:', response.data);
} catch (error) {
  console.error('Update failed:', error.response.data);
}
```

## Why your previous request failed
Your previous request included the following fields which were rejected:
1. **`username`**: The backend does not allow updating the username for security and integrity reasons.
2. **`aadharNumber`**: This field was missing from the `UpdateUserDto` on the backend. **I have now added it**, so it will work in your next request.

**Corrected Payload:**
Remove `"username": "rohan"` from your payload and it should work now.
