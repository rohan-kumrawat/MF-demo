# File Management System - Quick Reference

## Implementation Summary

### ✅ What's Been Implemented

1. **Cloudinary Integration**
   - Cloud Name: `duefcd5cn`
   - API Key: `138887945649781`
   - Free tier: 25GB storage + 25GB bandwidth (unlimited)

2. **Files Module Structure**
   - `src/modules/files/entities/file.entity.ts` - Database model
   - `src/modules/files/files.service.ts` - Business logic
   - `src/modules/files/files.controller.ts` - REST endpoints
   - `src/modules/files/cloudinary.service.ts` - Cloudinary wrapper
   - `src/modules/files/files.module.ts` - NestJS module

3. **API Endpoints** (All protected with JWT)
   ```
   POST   /files/upload                    - Upload file
   GET    /files/:fileId                   - Get file details
   GET    /files/customer/my-files         - List all customer files
   GET    /files/by-type/:documentType     - Filter by type
   DELETE /files/:fileId                   - Delete single file
   DELETE /files/delete-all/permanent      - Delete all files
   ```

4. **Database**
   - Table: `customer_files`
   - Indexes on: customerId, centreId, uploadedAt
   - Migration: `migrations/create_customer_files_table.sql`

5. **Features**
   - Max 100KB file size per receipt
   - Automatic Cloudinary deletion when DB record deleted
   - Document type categorization
   - Metadata storage (file name, mime type, size, description)
   - Customer isolation (can only access own files)

---

## Next Steps

### 1. Run Database Migration
```bash
# Execute the migration SQL on your PostgreSQL database
psql -h localhost -U postgres -d microfinance < migrations/create_customer_files_table.sql
```

### 2. Rebuild Backend
```bash
cd microfinance-backend
npm run build

# Or for development
npm run start:dev
```

### 3. Test the APIs
See `FILE_MANAGEMENT_API.md` for complete endpoint documentation and examples

### 4. Frontend Integration (if needed)
Example React component for file upload:
```javascript
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', 'loan_receipt');

  const response = await fetch('/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();
  console.log('File URL:', result.data.fileUrl);
};
```

---

## File Structure
```
microfinance-backend/
├── src/modules/files/
│   ├── entities/
│   │   └── file.entity.ts
│   ├── dto/
│   │   ├── upload-file.dto.ts
│   │   └── file-response.dto.ts
│   ├── files.controller.ts
│   ├── files.service.ts
│   ├── cloudinary.service.ts
│   └── files.module.ts
├── migrations/
│   └── create_customer_files_table.sql
├── .env (updated with Cloudinary config)
├── .env.example (updated)
├── FILE_MANAGEMENT_API.md (complete API docs)
└── FILE_MANAGEMENT_QUICK_REF.md (this file)
```

---

## Configuration Files Updated

### .env
```
CLOUDINARY_CLOUD_NAME=duefcd5cn
CLOUDINARY_API_KEY=138887945649781
CLOUDINARY_API_SECRET=4tps15lX_QgQRLoSakvJYhnJuik
```

### app.module.ts
- Added `FilesModule` import
- Added `CustomerFile` entity to TypeORM

---

## Key Features

### 📤 Upload
- Max 100KB per file
- Automatic file size validation
- Stores in Cloudinary with centre/customer folder structure
- Metadata saved to PostgreSQL

### 📥 Download
- Retrieve Cloudinary URLs from database
- Direct download via generated URLs
- No bandwidth charges for downloads (within Cloudinary free tier)

### 🗑️ Delete
- Single or batch deletion
- Automatic Cloudinary cleanup
- Database consistency maintained

### 🔒 Security
- JWT authentication required
- Customers can only access their own files
- Centre ID validation

---

## Important Notes

⚠️ **WARNING**: The API secret is now in `.env` - make sure `.env` is in `.gitignore`

✅ **BENEFITS**:
- Free for your expected usage (1000 customers × ~100KB each = ~100MB)
- No ongoing AWS charges
- Built-in CDN with Cloudinary
- Automatic file optimization

📊 **Cloudinary Usage Estimate**:
- 1000 customers × 100KB receipts = ~100MB
- Free tier: 25GB
- Remaining: ~24.9GB free capacity

---

## Support

For API documentation: See `FILE_MANAGEMENT_API.md`

For issues:
1. Check Cloudinary credentials in `.env`
2. Verify JWT token validity
3. Ensure database migration was applied
4. Check application logs for detailed errors

