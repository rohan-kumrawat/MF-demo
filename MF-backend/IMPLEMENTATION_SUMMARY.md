# 📁 Microfinance Backend - File Management System

## ✅ Implementation Complete

File upload/download/management system for customer receipts has been successfully implemented using **Cloudinary**.

---

## 🎯 What's Done

### Backend APIs Created
- ✅ `POST /files/upload` - Upload receipt/document
- ✅ `GET /files/:fileId` - Get file details  
- ✅ `GET /files/customer/my-files` - List all customer files
- ✅ `GET /files/by-type/:documentType` - Filter files by type
- ✅ `DELETE /files/:fileId` - Delete single file
- ✅ `DELETE /files/delete-all/permanent` - Delete all files

### Database
- ✅ `customer_files` table with indexes
- ✅ Migration SQL file ready
- ✅ Automatic Cloudinary cleanup on delete

### Modules & Services
- ✅ `FilesModule` - NestJS module with providers
- ✅ `FilesService` - Business logic with all CRUD operations
- ✅ `FilesController` - REST endpoints with JWT auth
- ✅ `CloudinaryService` - Wrapper for file upload/delete
- ✅ DTOs and Entity types

### Configuration
- ✅ Cloudinary credentials in `.env`
- ✅ app.module.ts updated with imports
- ✅ TypeORM entity registered

### Documentation
- ✅ `FILE_MANAGEMENT_API.md` - Complete API reference with cURL examples
- ✅ `FILE_MANAGEMENT_QUICK_REF.md` - Quick setup guide
- ✅ Database schema included
- ✅ Troubleshooting guide

---

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
psql -h localhost -U postgres -d microfinance < \
  /home/rohan/Code/microfinance-backend/migrations/create_customer_files_table.sql
```

### 2. Start Backend (already configured)
```bash
cd /home/rohan/Code/microfinance-backend
npm run start:dev
```

### 3. Test Upload
```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@receipt.pdf" \
  -F "documentType=loan_receipt"
```

---

## 📊 System Details

### Cloudinary Config
```
Cloud Name: duefcd5cn
API Key: 138887945649781
Free Tier: 25GB storage + 25GB bandwidth (unlimited)
```

### File Constraints
- **Max Size**: 100 KB per file
- **Types**: All file types supported
- **Limit per Customer**: Unlimited (storage permitting)

### Estimate for 1000 Customers
- 1000 × 100KB receipts = ~100MB
- Free tier capacity: 25GB
- **Remaining: 24.9GB free** ✅

---

## 📁 Files Created

```
src/modules/files/
├── entities/
│   └── file.entity.ts
├── dto/
│   ├── upload-file.dto.ts
│   └── file-response.dto.ts
├── files.controller.ts
├── files.service.ts
├── cloudinary.service.ts
└── files.module.ts

migrations/
└── create_customer_files_table.sql

Documentation/
├── FILE_MANAGEMENT_API.md (complete reference)
└── FILE_MANAGEMENT_QUICK_REF.md (quick guide)
```

---

## 🔐 Security

✅ **JWT Authentication**: All endpoints require valid JWT token
✅ **Customer Isolation**: Users can only access their own files
✅ **Centre ID Validation**: Files are scoped to centre
✅ **Automatic Cleanup**: Deleted files removed from Cloudinary

---

## 💾 Database Schema

```sql
customer_files
├── id (UUID, PK)
├── customerId (UUID, FK to users)
├── centreId (UUID, FK to centres)
├── cloudinaryPublicId (VARCHAR, UNIQUE)
├── fileUrl (VARCHAR)
├── originalFileName (VARCHAR)
├── mimeType (VARCHAR)
├── fileSize (INTEGER)
├── documentType (VARCHAR, nullable)
├── description (TEXT, nullable)
├── uploadedAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

Indexes:
- idx_customer_files_customer_id
- idx_customer_files_centre_customer
- idx_customer_files_uploaded_at
```

---

## 🧪 Ready to Test

### Postman Collection Format
```json
{
  "info": {
    "name": "File Management API",
    "description": "Customer file upload/download endpoints"
  },
  "item": [
    {
      "name": "Upload File",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/files/upload",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {"key": "file", "type": "file", "src": "receipt.pdf"},
            {"key": "documentType", "value": "loan_receipt"}
          ]
        }
      }
    }
  ]
}
```

---

## 🔄 API Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response (4xx/5xx)
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## 📝 Usage Examples

### React Component
```javascript
const UploadReceipt = ({ token }) => {
  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('documentType', 'loan_receipt');
    
    const res = await fetch('/files/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    
    const { data } = await res.json();
    window.open(data.fileUrl); // Open file in new tab
  };
  
  return <input type="file" onChange={handleUpload} />;
};
```

### Fetch All Customer Files
```javascript
const files = await fetch('/files/customer/my-files', {
  headers: { Authorization: `Bearer ${token}` },
}).then(r => r.json());

files.data.forEach(f => {
  console.log(`${f.originalFileName} - ${f.documentType}`);
});
```

---

## ⚠️ Important Notes

1. **`.env` is confidential** - Keep it secure and never commit to git
2. **Migration must be applied** - Database table needs to exist
3. **Cloudinary free tier** - Sufficient for planned usage
4. **JWT required** - All endpoints protected

---

## 📞 Support

For API documentation: **See `FILE_MANAGEMENT_API.md`**

For quick reference: **See `FILE_MANAGEMENT_QUICK_REF.md`**

For issues:
1. Verify `.env` has correct Cloudinary credentials
2. Check JWT token validity
3. Ensure database migration applied
4. Review application logs

---

## 🎉 Next Steps

1. ✅ Build: `npm run build` (passed)
2. ⏳ Apply migration: `psql ... < create_customer_files_table.sql`
3. ⏳ Start backend: `npm run start:dev`
4. ⏳ Test endpoints using Postman/cURL
5. ⏳ Integrate into frontend UI
6. ⏳ Deploy to production

---

**Implementation Date**: April 28, 2026  
**Status**: ✅ Ready for Testing  
**Free Tier**: ✅ Sufficient for 1000 customers

