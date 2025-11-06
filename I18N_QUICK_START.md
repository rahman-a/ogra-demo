# 🚀 Quick Start - i18n Implementation

## ✅ What's Been Set Up

Your Ogra application now has **complete localization support** for English and Arabic!

### 📦 Installed Packages
- `i18next` - Core i18n framework
- `react-i18next` - React bindings
- `i18next-resources-to-backend` - Dynamic translation loading
- `accept-language` - Language detection

### 🗂️ New Files Created

```
i18n/
├── settings.ts                    # Configuration
├── index.ts                       # Server-side hook
├── client.ts                      # Client-side hook
├── types.d.ts                     # TypeScript definitions
└── locales/
    ├── en/                        # English translations
    │   ├── common.json            # ✅ Common UI elements
    │   ├── auth.json              # ✅ Authentication
    │   ├── dashboard.json         # ✅ Dashboard
    │   ├── rides.json             # ✅ Rides & Bookings
    │   └── wallet.json            # ✅ Wallet & Transactions
    └── ar/                        # Arabic translations (RTL)
        ├── common.json            # ✅ Same structure
        ├── auth.json
        ├── dashboard.json
        ├── rides.json
        └── wallet.json

components/layout/
├── language-switcher.tsx          # ✅ Dropdown language switcher
└── simple-language-switcher.tsx   # ✅ Button language switcher

app/
├── layout.tsx                     # ✅ Redirects to default locale
└── [lng]/                         # ✅ All app pages moved here
    ├── layout.tsx                 # ✅ Main layout with i18n support
    ├── (driver)/                  # ✅ Driver routes
    ├── (passenger)/               # ✅ Passenger routes
    ├── auth/                      # ✅ Auth pages
    ├── api/                       # ✅ API routes
    └── ...

proxy.ts                          # ✅ Locale detection, routing & headers
```

## 🎯 How to Use Right Now

### 1. Start Your Dev Server
```bash
pnpm dev
```

### 2. Test the Languages

**English (Default):**
- Visit: `http://localhost:3000` → Redirects to `/en`
- Or directly: `http://localhost:3000/en/p/dashboard`

**Arabic (RTL):**
- Click the language switcher (EN/AR buttons in navbar)
- Or directly: `http://localhost:3000/ar/p/dashboard`

### 3. See It In Action

The **Rides page** has been fully translated as a demonstration:
- English: `http://localhost:3000/en/p/dashboard/rides`
- Arabic: `http://localhost:3000/ar/p/dashboard/rides`

## 🔨 Next Steps - Translating Your Pages

### Server Component Example

```typescript
// app/[lng]/your-page/page.tsx
import { useTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: { lng: Locale }
}

export default async function YourPage({ params }: Props) {
  const { lng } = params
  const { t } = await useTranslation(lng, 'common')

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('dashboard')}</p>
    </div>
  )
}
```

### Client Component Example

```typescript
'use client'

import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface Props {
  lng: Locale
}

export function YourComponent({ lng }: Props) {
  const { t } = useTranslation(lng, 'common')

  return <button>{t('submit')}</button>
}
```

## 📝 Update Your Existing Pages

To translate your existing pages, you need to:

### 1. Update Server Components

Add `params: { lng: Locale }` to your page props:

```typescript
// Before
export default async function MyPage() {
  // ...
}

// After
import type { Locale } from '@/i18n/settings'

export default async function MyPage({ params }: { params: { lng: Locale } }) {
  const { lng } = params
  // Now use lng to get translations
}
```

### 2. Update Client Components

Pass `lng` prop from parent and use client hook:

```typescript
// Parent (Server Component)
<MyClientComponent lng={lng} />

// Child (Client Component)
'use client'
import { useTranslation } from '@/i18n/client'

export function MyClientComponent({ lng }: { lng: Locale }) {
  const { t } = useTranslation(lng, 'common')
  // Use t() for translations
}
```

### 3. Update All Links

```typescript
// Before
<Link href="/dashboard">Dashboard</Link>

// After
<Link href={`/${lng}/dashboard`}>Dashboard</Link>
```

## 🎨 Available Translations

### Common (common.json)
```typescript
t('welcome')         // "Welcome" / "مرحباً"
t('dashboard')       // "Dashboard" / "لوحة التحكم"
t('profile')         // "Profile" / "الملف الشخصي"
t('wallet')          // "Wallet" / "المحفظة"
t('rides')           // "Rides" / "الرحلات"
t('submit')          // "Submit" / "إرسال"
t('cancel')          // "Cancel" / "إلغاء"
// ... and many more
```

### Auth (auth.json)
```typescript
const { t } = await useTranslation(lng, 'auth')

t('signin')          // "Sign In" / "تسجيل الدخول"
t('email')           // "Email Address" / "البريد الإلكتروني"
t('password')        // "Password" / "كلمة المرور"
```

### Dashboard (dashboard.json)
```typescript
const { t } = await useTranslation(lng, 'dashboard')

t('passengerDashboard')  // "Passenger Dashboard" / "لوحة تحكم الراكب"
t('activeRide')          // "Active Ride" / "الرحلة النشطة"
```

### Rides (rides.json)
```typescript
const { t } = await useTranslation(lng, 'rides')

t('title')               // "All Rides" / "جميع الرحلات"
t('bookingDetails')      // "Booking Details" / "تفاصيل الحجز"
t('noRides')            // "No rides found" / "لم يتم العثور على رحلات"
```

### Wallet (wallet.json)
```typescript
const { t } = await useTranslation(lng, 'wallet')

t('currentBalance')      // "Current Balance" / "الرصيد الحالي"
t('chargeWallet')       // "Charge Wallet" / "شحن المحفظة"
```

## 🌍 Adding New Translations

1. **Add to English**: `i18n/locales/en/common.json`
```json
{
  "myNewText": "Hello World"
}
```

2. **Add to Arabic**: `i18n/locales/ar/common.json`
```json
{
  "myNewText": "مرحبا بالعالم"
}
```

3. **Use in component**:
```typescript
{t('myNewText')}
```

## 🔧 Language Switcher Already Integrated

The navbar already includes the language switcher! Users can:
- Click **EN** or **AR** buttons to switch languages
- The choice is saved in a cookie
- The page updates with all translations

## ⚠️ Important Notes

1. **All routes now need `/[lng]/` prefix**
   - Old: `/p/dashboard`
   - New: `/en/p/dashboard` or `/ar/p/dashboard`

2. **Always pass `lng` to child components**
   ```typescript
   <ChildComponent lng={lng} />
   ```

3. **Use proper namespace**
   - Auth pages → `'auth'`
   - Dashboard → `'dashboard'`
   - Rides → `'rides'`
   - Wallet → `'wallet'`
   - Everything else → `'common'`

4. **Arabic is RTL (Right-to-Left)**
   - Automatically handled by `dir={dir(lng)}` in layout
   - Use `text-start` and `text-end` instead of `text-left`/`text-right`

## 📚 Full Documentation

For complete details, see: **[I18N_SETUP_GUIDE.md](./I18N_SETUP_GUIDE.md)**

## 🎉 You're All Set!

Your application now supports:
- ✅ English and Arabic languages
- ✅ Automatic language detection
- ✅ RTL support for Arabic
- ✅ Language switcher in navbar
- ✅ Persistent language preference
- ✅ Comprehensive translations for all features

Just run `pnpm dev` and test it out! 🚀

