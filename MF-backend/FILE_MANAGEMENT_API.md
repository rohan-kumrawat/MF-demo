# File Management APIs - Cloudinary Integration

Complete file upload, download, and management system for microfinance customers using Cloudinary.

---

## Overview

- **Service**: Cloudinary
- **Max Input File Size**: 10MB per file
- **Optimized Output Size**: 200KB target for images
- **Free Tier**: 25GB storage + 25GB bandwidth (unlimited)
- **Authentication**: JWT Token required (customer role)
- **Base URL**: `/files`

---

## API Endpoints

### 1. Upload Files
**Endpoint**: `POST /files/upload`

Upload one or more documents (receipt, KYC document, etc.). Each image is handled independently.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body**:
- `files` (required): One or more binary files, max 10MB input each
- `documentType` (optional): Category like "loan_receipt", "kyc_document"
- `description` (optional): Additional notes about the file

**cURL Example**:
```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@receipt_1.jpg" \
  -F "files=@receipt_2.png" \
  -F "files=@receipt_3.pdf" \
  -F "documentType=loan_receipt" \
  -F "description=EMI Payment Receipt - Apr 2026"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "customer-uuid",
      "centreId": "centre-uuid",
      "originalFileName": "receipt_1.jpg",
      "fileUrl": "https://res.cloudinary.com/duefcd5cn/image/upload/...",
      "mimeType": "image/webp",
      "fileSize": 198432,
      "documentType": "loan_receipt",
      "description": "EMI Payment Receipt - Apr 2026",
      "uploadedAt": "2026-04-28T10:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- 400: No file provided / File exceeds size limit
- 401: Unauthorized (invalid/missing JWT)
- 500: Upload failed

---

### 2. Get Single File
**Endpoint**: `GET /files/:fileId`

Retrieve details and URL of a specific file

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `fileId`: The file UUID

**cURL Example**:
```bash
curl http://localhost:3000/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "customer-uuid",
    "centreId": "centre-uuid",
    "originalFileName": "receipt.pdf",
    "fileUrl": "https://res.cloudinary.com/...",
    "mimeType": "application/pdf",
    "fileSize": 85432,
    "documentType": "loan_receipt",
    "description": "EMI Payment Receipt - Apr 2026",
    "uploadedAt": "2026-04-28T10:30:00.000Z"
  }
}
```

**Error Responses**:
- 401: Unauthorized
- 404: File not found

---

### 3. Get My Files
**Endpoint**: `GET /files/customer/my-files`

Get all files uploaded by the authenticated customer

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**: None

**cURL Example**:
```bash
curl http://localhost:3000/files/customer/my-files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "customer-uuid",
      "centreId": "centre-uuid",
      "originalFileName": "receipt.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "fileSize": 85432,
      "documentType": "loan_receipt",
      "description": "EMI Payment Receipt - Apr 2026",
      "uploadedAt": "2026-04-28T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "customerId": "customer-uuid",
      "centreId": "centre-uuid",
      "originalFileName": "aadhar.jpg",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "image/jpeg",
      "fileSize": 45000,
      "documentType": "kyc_document",
      "description": "Aadhar Card - KYC",
      "uploadedAt": "2026-04-27T15:20:00.000Z"
    }
  ]
}
```

---

### 4. Get Files by Document Type
**Endpoint**: `GET /files/by-type/:documentType`

Retrieve all files of a specific document type for the customer

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `documentType`: Category filter (e.g., "loan_receipt", "kyc_document")

**cURL Example**:
```bash
curl http://localhost:3000/files/by-type/loan_receipt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "customer-uuid",
      "centreId": "centre-uuid",
      "originalFileName": "receipt_apr.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "fileSize": 85432,
      "documentType": "loan_receipt",
      "description": "EMI Payment Receipt - Apr 2026",
      "uploadedAt": "2026-04-28T10:30:00.000Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "customerId": "customer-uuid",
      "centreId": "centre-uuid",
      "originalFileName": "receipt_mar.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "fileSize": 78000,
      "documentType": "loan_receipt",
      "description": "EMI Payment Receipt - Mar 2026",
      "uploadedAt": "2026-03-28T10:30:00.000Z"
    }
  ]
}
```

---

### 5. Delete File
**Endpoint**: `DELETE /files/:fileId`

Delete a specific file (removes from Cloudinary and database)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `fileId`: The file UUID

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Responses**:
- 401: Unauthorized
- 404: File not found

---

### 6. Delete All Files
**Endpoint**: `DELETE /files/delete-all/permanent`

Delete all files for the authenticated customer

⚠️ **CAUTION**: This action is permanent and cannot be undone!

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/files/delete-all/permanent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Deleted 5 file(s) for customer",
  "deletedCount": 5
}
```

---

## Error Handling

All endpoints return standardized error responses:

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum limit of 100KB. Received: 125.50KB",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "File not found",
  "error": "Not Found"
}
```

### Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "Internal Server Error"
}
```

---

### File Size Limits

- **Maximum input file size**: 10 MB per file
- **Image upload behavior**: each image is compressed independently to ~200 KB target before upload
- **Already-small images**: if an image is already under 200 KB, it uploads as-is
- **PDF / non-image files**: uploaded as-is if already within 200 KB target
- **Allowed formats**: JPEG, JPG, PNG, WEBP, PDF, and other supported file types
- **Cloudinary free tier**: 25 GB total storage (more than enough for 1000 customers with receipts)

---

## Usage Examples

### JavaScript/Node.js

```javascript
// Upload a file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('documentType', 'loan_receipt');
formData.append('description', 'EMI Payment Receipt');

const response = await fetch('/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
  },
  body: formData,
});

const result = await response.json();
console.log(result.data.fileUrl); // Use this URL to download
```

### React

```javascript
const uploadFile = async (file, documentType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  try {
    const response = await fetch('/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (response.ok) {
      const { data } = await response.json();
      console.log('File uploaded:', data.fileUrl);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## Database Schema

### customer_files Table
```sql
CREATE TABLE customer_files (
  id UUID PRIMARY KEY,
  customerId UUID NOT NULL,
  centreId UUID NOT NULL,
  
  cloudinaryPublicId VARCHAR(255) UNIQUE NOT NULL,
  fileUrl VARCHAR(500) NOT NULL,
  originalFileName VARCHAR(255) NOT NULL,
  mimeType VARCHAR(100) NOT NULL,
  fileSize INTEGER NOT NULL,
  
  documentType VARCHAR(50),
  description TEXT,
  
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_customer_files_customer_id ON customer_files(customerId);
CREATE INDEX idx_customer_files_centre_customer ON customer_files(centreId, customerId);
CREATE INDEX idx_customer_files_uploaded_at ON customer_files(uploadedAt);
```

---

## Cloudinary Configuration

**Environment Variables** (`.env`):
```
CLOUDINARY_CLOUD_NAME=duefcd5cn
CLOUDINARY_API_KEY=138887945649781
CLOUDINARY_API_SECRET=4tps15lX_QgQRLoSakvJYhnJuik
```

**Free Tier Limits**:
- 25 GB storage (includes all uploads)
- 25 GB bandwidth (monthly)
- Unlimited API calls
- Perfect for 1000 customers × ~200KB optimized receipts per image

---

## Troubleshooting

### Upload fails with "File size exceeds limit"
- Ensure each file is under 10 MB input
- Images will be auto-compressed individually; PDFs should already be near 200 KB

### File URL not accessible
- Cloudinary URLs are public by default
- Check that the file was successfully uploaded in Cloudinary dashboard

### Unauthorized errors
- Verify JWT token is valid and not expired
- Include `Authorization: Bearer <token>` header

### Files not appearing after upload
- Ensure customer has correct `centreId`
- Check database indexes are created
- Verify Cloudinary credentials are correct

---

## API Testing Checklist

- [ ] Upload file successfully
- [ ] Retrieve uploaded file
- [ ] List all customer files
- [ ] Filter files by document type
- [ ] Delete single file
- [ ] Delete all files
- [ ] Test file size limit (upload >10MB input or large PDF)
- [ ] Test multiple-image upload in one request
- [ ] Test unauthorized access (no JWT)
- [ ] Test cross-customer file access (security)

