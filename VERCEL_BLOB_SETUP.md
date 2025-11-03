# Vercel Blob Storage Setup Guide

## Problem

File uploads were failing on Vercel with error:

```
Error: ENOENT: no such file or directory, mkdir '/var/task/public'
```

**Cause**: Vercel's serverless functions have a **read-only filesystem** (except `/tmp`). You cannot write files to `/public` or any directory permanently.

## Solution

Use **Vercel Blob Storage** - a managed object storage service designed for Vercel deployments.

## Installation

Already installed:

```bash
pnpm install @vercel/blob
```

✅ **Package**: `@vercel/blob@2.0.0`

## Setup Steps

### 1. Create Blob Store in Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Blob** storage
5. Click **Create**
6. Copy the generated `BLOB_READ_WRITE_TOKEN`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create blob store
vercel blob create ogra-uploads
```

### 2. Add Environment Variable

#### For Vercel (Production)

1. Go to **Project Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: [Token from Blob store creation]
   - **Environment**: Production, Preview, Development

#### For Local Development

Add to your `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...your_token_here
```

⚠️ **Important**: Don't commit this token to Git!

Update your `.gitignore` to ensure:

```gitignore
.env*
!.env.example
```

### 3. Redeploy

After adding the environment variable:

```bash
# Commit your changes
git add .
git commit -m "feat: migrate to Vercel Blob storage"
git push

# Or manually redeploy in Vercel dashboard
```

## Code Changes Made

### Before (Local Filesystem - ❌ Doesn't work on Vercel)

```typescript
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

async function saveFile(file: File, userId: string, fileType: string) {
  const uploadDir = join(process.cwd(), 'public', 'uploads', userId)
  await mkdir(uploadDir, { recursive: true })

  const filepath = join(uploadDir, filename)
  await writeFile(filepath, buffer)

  return `/uploads/${userId}/${filename}`
}
```

### After (Vercel Blob - ✅ Works on Vercel)

```typescript
import { put } from '@vercel/blob'

async function saveFile(file: File, userId: string, fileType: string) {
  const filename = `uploads/${userId}/${fileType}_${timestamp}.${extension}`

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return blob.url
}
```

## Benefits of Vercel Blob

✅ **Works on Vercel** - No filesystem limitations
✅ **Global CDN** - Files served from edge locations worldwide
✅ **Automatic optimization** - Images automatically optimized
✅ **Secure** - Built-in access control
✅ **Scalable** - No storage limits concerns
✅ **Free tier** - Generous free tier included

## File URL Format

**Before** (Local):

```
/uploads/user123/license_1699876543.pdf
```

**After** (Blob):

```
https://your-project.public.blob.vercel-storage.com/uploads/user123/license_1699876543.pdf
```

## Database Migration

Your database already stores these URLs in string fields, so no migration needed:

```prisma
model User {
  licenseDocument String?  // Stores full URL
  criminalRecord  String?  // Stores full URL
  drugReport      String?  // Stores full URL
  formalPhoto     String?  // Stores full URL
}
```

## Displaying Files

No changes needed in your frontend - URLs work the same:

```tsx
{
  user.formalPhoto && <img src={user.formalPhoto} alt='Formal Photo' />
}
```

## File Upload Limits

| Tier             | Max File Size | Storage      |
| ---------------- | ------------- | ------------ |
| **Hobby** (Free) | 4.5 MB        | 1 GB total   |
| **Pro**          | 500 MB        | 100 GB total |

If you need larger files, consider:

- Compressing images before upload
- Using AWS S3 for large files
- Upgrading to Pro plan

## Testing Locally

To test locally with Vercel Blob:

1. Make sure `BLOB_READ_WRITE_TOKEN` is in `.env.local`
2. Run development server:
   ```bash
   pnpm dev
   ```
3. Upload a file through your profile form
4. Check file appears in Vercel Blob dashboard

## Alternative Solutions

If you don't want to use Vercel Blob, other options:

### 1. AWS S3

```bash
pnpm install @aws-sdk/client-s3
```

### 2. Cloudinary

```bash
pnpm install cloudinary
```

### 3. UploadThing

```bash
pnpm install uploadthing
```

### 4. Supabase Storage

```bash
pnpm install @supabase/storage-js
```

## Troubleshooting

### Error: Missing BLOB_READ_WRITE_TOKEN

**Problem**: Environment variable not set

**Solution**:

1. Check variable exists in Vercel dashboard
2. Redeploy after adding variable
3. Variable name must be exact: `BLOB_READ_WRITE_TOKEN`

### Error: Unauthorized

**Problem**: Invalid or expired token

**Solution**:

1. Regenerate token in Vercel dashboard
2. Update environment variable
3. Redeploy

### Files not uploading

**Problem**: File size too large

**Solution**:

1. Check file size limit (4.5 MB on free tier)
2. Compress images before upload
3. Add validation in your form

### Old local files still showing

**Problem**: Database has old `/uploads/` paths

**Solution**:
Users need to re-upload files, or run migration to remove old paths:

```typescript
// Migration script (optional)
await prisma.user.updateMany({
  where: {
    OR: [
      { licenseDocument: { startsWith: '/uploads/' } },
      { criminalRecord: { startsWith: '/uploads/' } },
      { drugReport: { startsWith: '/uploads/' } },
      { formalPhoto: { startsWith: '/uploads/' } },
    ],
  },
  data: {
    licenseDocument: null,
    criminalRecord: null,
    drugReport: null,
    formalPhoto: null,
  },
})
```

## Security Best Practices

1. **Validate file types**:

```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type')
}
```

2. **Validate file size**:

```typescript
const maxSize = 4.5 * 1024 * 1024 // 4.5 MB
if (file.size > maxSize) {
  throw new Error('File too large')
}
```

3. **Sanitize filenames**:

```typescript
const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
```

## Cost Considerations

### Free Tier (Hobby)

- 1 GB storage
- 100 GB bandwidth/month
- **Cost**: $0/month

### Pro Tier

- 100 GB storage
- Unlimited bandwidth
- **Cost**: $0.15/GB/month

For most applications, free tier is sufficient!

## Monitoring

Check your usage in Vercel dashboard:

1. Go to **Storage** tab
2. Click on your Blob store
3. View usage metrics

## Migration Checklist

- [x] Install `@vercel/blob` package
- [x] Update `UpdateProfile.ts` to use Blob storage
- [ ] Add `BLOB_READ_WRITE_TOKEN` to Vercel environment variables
- [ ] Add `BLOB_READ_WRITE_TOKEN` to `.env.local` for local dev
- [ ] Test file upload locally
- [ ] Deploy to Vercel
- [ ] Test file upload on production
- [ ] Update documentation

## Resources

- **Vercel Blob Docs**: https://vercel.com/docs/storage/vercel-blob
- **API Reference**: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk
- **Pricing**: https://vercel.com/docs/storage/vercel-blob/usage-and-pricing

---

**Last Updated**: November 3, 2025
**Status**: ✅ Code updated, ready for deployment
