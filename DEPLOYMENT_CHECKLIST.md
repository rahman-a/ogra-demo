# Deployment Checklist - File Upload Fix

## ❌ Problem

File uploads failing on Vercel with error:

```
Error: ENOENT: no such file or directory, mkdir '/var/task/public'
```

## ✅ Solution

Migrated from local filesystem to **Vercel Blob Storage**

---

## 🚀 Deployment Steps

### 1. Code Changes (✅ Done)

- [x] Installed `@vercel/blob` package
- [x] Updated `actions/UpdateProfile.ts` to use Blob storage
- [x] Created `.env.example` with required variables
- [x] Created documentation (`VERCEL_BLOB_SETUP.md`)

### 2. Vercel Blob Setup (⚠️ Required)

#### Step 2a: Create Blob Store

**Via Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Blob**
6. Click **Create**
7. **Copy the `BLOB_READ_WRITE_TOKEN`** (you'll need this!)

#### Step 2b: Add Environment Variable

1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: [Paste token from Step 2a]
   - **Environments**: ✅ Production ✅ Preview ✅ Development
3. Click **Save**

### 3. Local Development Setup (⚠️ Required for local testing)

Add to your `.env.local` (create if doesn't exist):

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXX
```

⚠️ **Don't commit this file!** (Already in `.gitignore`)

### 4. Deploy to Vercel

```bash
# Commit the changes
git add .
git commit -m "fix: migrate file uploads to Vercel Blob Storage"
git push origin main

# Vercel will auto-deploy
# Or trigger manual deploy in Vercel dashboard
```

### 5. Test the Deployment

1. Go to your deployed app
2. Navigate to profile/settings page
3. Try uploading a document/image
4. Verify upload succeeds
5. Check file appears in Vercel Blob dashboard

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] `BLOB_READ_WRITE_TOKEN` environment variable is set in Vercel
- [ ] Blob store exists in Vercel Storage dashboard
- [ ] File upload form loads without errors
- [ ] Files upload successfully
- [ ] Uploaded files display correctly
- [ ] File URLs start with `https://...vercel-storage.com/...`

---

## 🐛 Troubleshooting

### Issue: "Missing BLOB_READ_WRITE_TOKEN"

**Cause**: Environment variable not set

**Fix**:

1. Check variable exists in Vercel → Settings → Environment Variables
2. Variable name must be exact: `BLOB_READ_WRITE_TOKEN`
3. Redeploy after adding variable

### Issue: "Unauthorized" error

**Cause**: Invalid or expired token

**Fix**:

1. Regenerate token in Vercel Blob dashboard
2. Update environment variable
3. Redeploy

### Issue: Upload works locally but not on Vercel

**Cause**: Environment variable not deployed

**Fix**:

1. Verify token is in Vercel environment variables
2. Check token is for correct Blob store
3. Trigger a new deployment (redeploy)

### Issue: "File too large" error

**Cause**: File exceeds limit (4.5 MB on free tier)

**Fix**:

- Compress images before upload
- Add client-side validation
- Upgrade to Pro plan for 500 MB limit

---

## 📊 Current Status

| Item                 | Status                 |
| -------------------- | ---------------------- |
| Code Migration       | ✅ Complete            |
| Package Installation | ✅ Complete            |
| Documentation        | ✅ Complete            |
| Environment Variable | ⚠️ **ACTION REQUIRED** |
| Deployment           | ⏳ Pending             |
| Testing              | ⏳ Pending             |

---

## 🔐 Security Notes

- ✅ `BLOB_READ_WRITE_TOKEN` is secret - never commit to Git
- ✅ Files stored with public access by default
- ⚠️ Add file type validation (recommended)
- ⚠️ Add file size validation (recommended)

---

## 💰 Cost Impact

**Free Tier (Hobby Plan)**:

- Storage: 1 GB
- Bandwidth: 100 GB/month
- **Cost**: $0/month

Your file uploads (PDFs, images) will easily fit within free tier limits.

---

## 📚 Additional Resources

- **Setup Guide**: `VERCEL_BLOB_SETUP.md`
- **Vercel Blob Docs**: https://vercel.com/docs/storage/vercel-blob
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables

---

## ✅ Next Steps

1. **Go to Vercel Dashboard** → Create Blob Store
2. **Copy Token** → Add to Environment Variables
3. **Deploy** → `git push`
4. **Test** → Upload a file
5. **Celebrate** → 🎉 File uploads work on production!

---

**Last Updated**: November 3, 2025
**Urgency**: 🔴 **HIGH** - Required for file uploads to work
