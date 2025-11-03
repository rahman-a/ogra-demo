# 🚨 Quick Fix - File Upload Error on Vercel

## The Error

```
Error: ENOENT: no such file or directory, mkdir '/var/task/public'
```

## The Fix (5 Minutes)

### Step 1: Create Blob Storage

1. Go to https://vercel.com/dashboard
2. Click your project → **Storage** tab
3. **Create Database** → Select **Blob** → **Create**
4. **Copy** the `BLOB_READ_WRITE_TOKEN` shown

### Step 2: Add Environment Variable

1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Name: `BLOB_READ_WRITE_TOKEN`
4. Value: [Paste token from Step 1]
5. Check: ✅ Production ✅ Preview ✅ Development
6. **Save**

### Step 3: Deploy

```bash
git push
```

That's it! File uploads will now work. ✅

---

## For Local Development

Create `.env.local` in your project root:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXX
```

---

## What Changed?

**Before**: Saved files to `/public/uploads/` (doesn't work on Vercel)
**After**: Uploads to Vercel Blob Storage (works everywhere)

---

## Testing

1. Go to your deployed site
2. Upload a file
3. Should work now! 🎉

---

Need more details? See `VERCEL_BLOB_SETUP.md`
