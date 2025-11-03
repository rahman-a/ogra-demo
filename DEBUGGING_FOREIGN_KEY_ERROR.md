# Debugging Foreign Key Constraint Error

## Error Details

```
Foreign key constraint violated on the constraint: `Wallet_userId_fkey`
```

**Location**: `actions/ScanBarcode.ts:212`

## What This Error Means

The system is trying to create a `Wallet` record with a `userId` that doesn't exist in the `User` table. This violates the foreign key constraint defined in the Prisma schema:

```prisma
model Wallet {
  userId  String @unique
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ...
}
```

## Root Causes

### 1. **User Doesn't Exist in Database**

The most common cause - `session.user.id` points to a user that doesn't exist.

**How to check:**

```typescript
// Add this at the beginning of scanBarcode function
console.log('Session user ID:', session.user.id)

const userCheck = await prisma.user.findUnique({
  where: { id: session.user.id },
})
console.log('User exists?', !!userCheck)
```

### 2. **Session ID Mismatch**

The session might contain a different ID than what's in the database.

**Common scenarios:**

- Using JWT sub field instead of database ID
- Session created before user was fully persisted
- Session from old authentication system

### 3. **Database Migration Issue**

Users were migrated but sessions weren't updated.

### 4. **ID Format Mismatch**

- Session has UUID format: `550e8400-e29b-41d4-a716-446655440000`
- Database expects CUID format: `clp4abc123...`

## Solution Implemented

Added validation before wallet creation:

```typescript
// 1. Verify user exists
const userExists = await prisma.user.findUnique({
  where: { id: session.user.id },
})

if (!userExists) {
  return {
    success: false,
    message: 'User session invalid. Please log in again.',
  }
}

// 2. Try-catch for wallet creation
try {
  wallet = await prisma.wallet.create({
    data: {
      userId: session.user.id,
      balance: 0,
    },
  })
} catch (error) {
  console.error('Wallet creation error:', error)
  return {
    success: false,
    message: 'Failed to create wallet. Please contact support.',
  }
}
```

## How to Debug This Issue

### Step 1: Check Current User

```bash
# Open Prisma Studio
npx prisma studio
```

1. Go to `User` model
2. Check if your test user exists
3. Note the exact `id` value

### Step 2: Check Session Data

Add logging to see what's in the session:

```typescript
// In actions/ScanBarcode.ts, add after auth() call
console.log('=== SESSION DEBUG ===')
console.log('Session:', JSON.stringify(session, null, 2))
console.log('User ID:', session?.user?.id)
console.log('User Role:', session?.user?.role)
console.log('==================')
```

### Step 3: Verify Database Connection

```typescript
// Add this test query
const userCount = await prisma.user.count()
console.log('Total users in database:', userCount)
```

### Step 4: Check Auth Configuration

Look at `auth.ts` to see how user IDs are set:

```typescript
// Check the authorize function and callbacks
callbacks: {
  jwt({ token, user }) {
    if (user) {
      token.role = user.role
      token.id = user.id  // ← Make sure this is set correctly
    }
    return token
  },
  session({ session, token }) {
    return {
      ...session,
      user: {
        ...session.user,
        role: token.role as Role,
        id: token.id as string,  // ← Make sure this matches DB
      },
    }
  },
}
```

## Quick Fixes

### Fix 1: Re-login

The simplest solution - have the user log out and log back in:

```typescript
// Add to your error toast
toast.error('Session expired', {
  description: 'Please log out and log back in.',
  duration: 7000,
  action: {
    label: 'Logout',
    onClick: () => {
      window.location.href = '/api/auth/signout'
    },
  },
})
```

### Fix 2: Create User First

If testing, make sure user exists:

```bash
# In Prisma Studio or via script:
# 1. Create a User
# 2. Then try to scan barcode
```

### Fix 3: Check Database Constraints

```sql
-- Run this in your PostgreSQL database
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conname = 'Wallet_userId_fkey';
```

### Fix 4: Reset Database (Development Only)

```bash
# ⚠️ CAUTION: This deletes all data
npx prisma migrate reset
npx prisma db push
npx prisma db seed  # if you have seeds
```

## Prevention

### 1. Add Middleware

Create middleware to validate sessions:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await auth()

  if (session?.user?.id) {
    // Validate user still exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      // Invalidate session
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }
}
```

### 2. Add Health Check

Create an endpoint to verify user exists:

```typescript
// app/api/health/user/route.ts
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return Response.json({ exists: false })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  return Response.json({ exists: !!user })
}
```

### 3. Automatic Wallet Creation

Create wallets automatically when users sign up:

```typescript
// In your signup action
const user = await prisma.user.create({
  data: {
    // ... user data
    wallet: {
      create: {
        balance: 0,
      },
    },
  },
})
```

## Testing Scenario

Create a test to reproduce and fix:

```typescript
// Test file
describe('ScanBarcode with missing user', () => {
  it('should handle missing user gracefully', async () => {
    // Mock session with non-existent user ID
    const mockSession = {
      user: {
        id: 'non-existent-id',
        email: 'test@test.com',
        role: 'PASSENGER',
      },
    }

    const result = await scanBarcode('route:seat', mockSession)

    expect(result.success).toBe(false)
    expect(result.message).toContain('session invalid')
  })
})
```

## Common Scenarios & Solutions

| Scenario            | Cause                 | Solution                     |
| ------------------- | --------------------- | ---------------------------- |
| Development testing | User doesn't exist    | Create user in Prisma Studio |
| After migration     | Old session IDs       | Force re-login for all users |
| Production error    | Deleted user          | Add user existence check     |
| Intermittent error  | Race condition        | Add transaction handling     |
| All users affected  | Auth misconfiguration | Check auth.ts callbacks      |

## When to Contact Support

Contact support if:

- Error persists after re-login
- Multiple users affected
- Error occurs with newly created accounts
- User exists in DB but error still occurs

## Additional Resources

- **Prisma Foreign Keys**: https://www.prisma.io/docs/concepts/components/prisma-schema/relations
- **NextAuth Session**: https://next-auth.js.org/configuration/callbacks
- **Debugging Guide**: https://www.prisma.io/docs/guides/database/troubleshooting-orm

---

**Last Updated**: November 3, 2025
