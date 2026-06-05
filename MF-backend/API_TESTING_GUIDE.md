# API Testing Payloads & Examples

## Quick Test Guide

### 1. Upload Files

**Request**:
```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "files=@receipt_1.jpg" \
  -F "files=@receipt_2.png" \
  -F "files=@receipt_3.pdf" \
  -F "documentType=loan_receipt" \
  -F "description=May EMI Payment Receipt"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "223e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "receipt_1.jpg",
      "fileUrl": "https://res.cloudinary.com/duefcd5cn/image/upload/v1719568200/microfinance/centres/223e4567-e89b-12d3-a456-426614174000/customers/123e4567-e89b-12d3-a456-426614174000/receipt_1.jpg",
      "mimeType": "image/webp",
      "fileSize": 198432,
      "documentType": "loan_receipt",
      "description": "May EMI Payment Receipt",
      "uploadedAt": "2026-04-28T10:30:00.000Z"
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "223e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "receipt_2.png",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "image/webp",
      "fileSize": 176840,
      "documentType": "loan_receipt",
      "description": "May EMI Payment Receipt",
      "uploadedAt": "2026-04-28T10:30:01.000Z"
    }
  }
}
```

---

### 2. Get Single File

**Request**:
```bash
curl http://localhost:3000/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "centreId": "223e4567-e89b-12d3-a456-426614174000",
    "originalFileName": "receipt.pdf",
    "fileUrl": "https://res.cloudinary.com/...",
    "mimeType": "application/pdf",
    "fileSize": 85432,
    "documentType": "loan_receipt",
    "description": "May EMI Payment Receipt",
    "uploadedAt": "2026-04-28T10:30:00.000Z"
  }
}
```

---

### 3. List All Files

**Request**:
```bash
curl http://localhost:3000/files/customer/my-files \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "223e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "receipt_may.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "fileSize": 85432,
      "documentType": "loan_receipt",
      "description": "May EMI Payment Receipt",
      "uploadedAt": "2026-04-28T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "223e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "aadhar.jpg",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "image/jpeg",
      "fileSize": 45000,
      "documentType": "kyc_document",
      "description": "Aadhar Card - KYC",
      "uploadedAt": "2026-04-27T15:20:00.000Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "223e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "receipt_april.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "fileSize": 78000,
      "documentType": "loan_receipt",
      "description": "April EMI Payment Receipt",
      "uploadedAt": "2026-04-27T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Filter by Document Type

**Request**:
```bash
curl http://localhost:3000/files/by-type/loan_receipt \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "223e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "receipt_may.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "fileSize": 85432,
      "documentType": "loan_receipt",
      "description": "May EMI Payment Receipt",
      "uploadedAt": "2026-04-28T10:30:00.000Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "centreId": "223e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "receipt_april.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "mimeType": "application/pdf",
      "fileSize": 78000,
      "documentType": "loan_receipt",
      "description": "April EMI Payment Receipt",
      "uploadedAt": "2026-04-27T10:30:00.000Z"
    }
  ]
}
```

---

### 5. Delete Single File

**Request**:
```bash
curl -X DELETE http://localhost:3000/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### 6. Delete All Files

**Request**:
```bash
curl -X DELETE http://localhost:3000/files/delete-all/permanent \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Deleted 3 file(s) for customer",
  "deletedCount": 3
}
```

---

## Error Responses

### 400 - Bad Request (File Too Large)

**Request**:
```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@large_file.pdf"  # > 100KB
```

**Response** (400):
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum limit of 100KB. Received: 125.50KB",
  "error": "Bad Request"
}
```

---

### 400 - Bad Request (No File)

**Response** (400):
```json
{
  "statusCode": 400,
  "message": "No file provided",
  "error": "Bad Request"
}
```

---

### 401 - Unauthorized (Missing Token)

**Response** (401):
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

### 404 - Not Found

**Response** (404):
```json
{
  "statusCode": 404,
  "message": "File not found",
  "error": "Not Found"
}
```

---

## JavaScript/TypeScript Examples

### React Upload Component

```javascript
import React, { useState } from 'react';

export const FileUpload = ({ token }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 102400) {
      setError('File must be less than 100KB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'loan_receipt');
    formData.append('description', `Receipt uploaded at ${new Date().toLocaleDateString()}`);

    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`File uploaded successfully: ${result.data.originalFileName}`);
        e.target.value = ''; // Clear input
        console.log('File URL:', result.data.fileUrl);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleUpload} 
        disabled={uploading}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};
```

### Fetch All Files

```javascript
async function fetchAllFiles(token) {
  const response = await fetch('/files/customer/my-files', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch files');

  const { data } = await response.json();
  return data;
}

// Usage
const files = await fetchAllFiles(jwtToken);
files.forEach(file => {
  console.log(`${file.originalFileName} (${file.documentType})`);
});
```

### Download/Open File

```javascript
function openFile(fileUrl) {
  window.open(fileUrl, '_blank');
}

function downloadFile(fileUrl, fileName) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

### Delete File

```javascript
async function deleteFile(fileId, token) {
  const response = await fetch(`/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to delete file');

  const result = await response.json();
  console.log(result.message);
}
```

---

## CURL Batch Testing

### Test All Endpoints

```bash
#!/bin/bash

TOKEN="your_jwt_token_here"
BASE_URL="http://localhost:3000"

echo "1️⃣  Testing Upload..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@receipt.pdf" \
  -F "documentType=loan_receipt")

FILE_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Uploaded: $FILE_ID"

echo "2️⃣  Testing Get File..."
curl -s "$BASE_URL/files/$FILE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "3️⃣  Testing List All..."
curl -s "$BASE_URL/files/customer/my-files" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo "4️⃣  Testing Filter by Type..."
curl -s "$BASE_URL/files/by-type/loan_receipt" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo "5️⃣  Testing Delete..."
curl -s -X DELETE "$BASE_URL/files/$FILE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "✅ All tests completed!"
```

---

## Postman Collection JSON

```json
{
  "info": {
    "name": "File Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload File",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "receipt.pdf"
            },
            {
              "key": "documentType",
              "value": "loan_receipt",
              "type": "text"
            },
            {
              "key": "description",
              "value": "May EMI Payment",
              "type": "text"
            }
          ]
        },
        "url": "{{base_url}}/files/upload"
      }
    },
    {
      "name": "Get My Files",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}",
            "type": "text"
          }
        ],
        "url": "{{base_url}}/files/customer/my-files"
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ]
}
```

---

**Last Updated**: April 28, 2026  
**API Version**: 1.0  
**Status**: Ready for Testing

