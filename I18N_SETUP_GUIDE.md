# i18n Setup Guide

This application now has full internationalization (i18n) support for **English** and **Arabic** using `i18next` and `react-i18next`.

## 🌍 Supported Languages

- **English (en)** - Default
- **Arabic (ar)** - RTL support included

## 📁 Project Structure

```
i18n/
├── settings.ts           # i18n configuration and settings
├── index.ts             # Server-side translation hook
├── client.ts            # Client-side translation hook
└── locales/
    ├── en/              # English translations
    │   ├── common.json
    │   ├── auth.json
    │   ├── dashboard.json
    │   ├── rides.json
    │   └── wallet.json
    └── ar/              # Arabic translations
        ├── common.json
        ├── auth.json
        ├── dashboard.json
        ├── rides.json
        └── wallet.json
```

## 🚀 How to Use Translations

### In Server Components

```typescript
import { useTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: { lng: Locale }
}

export default async function MyPage({ params }: Props) {
  const { lng } = params
  const { t } = await useTranslation(lng, 'common') // namespace: 'common'

  return <h1>{t('welcome')}</h1>
}
```

### In Client Components

```typescript
'use client'

import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface MyComponentProps {
  lng: Locale
}

export function MyComponent({ lng }: MyComponentProps) {
  const { t } = useTranslation(lng, 'common')

  return <p>{t('welcome')}</p>
}
```

## 📝 Translation Namespaces

### 1. **common.json**
General UI elements, navigation, buttons, etc.

```json
{
  "welcome": "Welcome",
  "dashboard": "Dashboard",
  "profile": "Profile",
  // ...
}
```

### 2. **auth.json**
Authentication related translations (login, signup, errors)

```json
{
  "signin": "Sign In",
  "signup": "Sign Up",
  "email": "Email Address",
  // ...
}
```

### 3. **dashboard.json**
Dashboard specific translations

```json
{
  "passengerDashboard": "Passenger Dashboard",
  "driverDashboard": "Driver Dashboard",
  // ...
}
```

### 4. **rides.json**
Rides and booking related translations

```json
{
  "title": "All Rides",
  "bookingDetails": "Booking Details",
  // ...
}
```

### 5. **wallet.json**
Wallet and transactions translations

```json
{
  "title": "Wallet",
  "currentBalance": "Current Balance",
  // ...
}
```

## 🔄 Language Switcher

Two language switcher components are available:

### SimpleLanguageSwitcher (Recommended)
Simple buttons for language selection:

```typescript
import { SimpleLanguageSwitcher } from '@/components/layout/simple-language-switcher'

<SimpleLanguageSwitcher lng={lng} />
```

### LanguageSwitcher (Dropdown)
Dropdown menu with Globe icon:

```typescript
import { LanguageSwitcher } from '@/components/layout/language-switcher'

<LanguageSwitcher lng={lng} />
```

## 🛣️ Routing

All routes now include the locale prefix:

- English: `/en/...`
- Arabic: `/ar/...`

Example routes:
- `/en/p/dashboard` - English passenger dashboard
- `/ar/p/dashboard` - Arabic passenger dashboard
- `/en/auth/signin` - English sign-in
- `/ar/auth/signin` - Arabic sign-in

The middleware automatically redirects root paths to include the locale based on:
1. Cookie preference (`i18next`)
2. Browser's `Accept-Language` header
3. Default fallback (English)

## 🎨 RTL Support

Arabic language automatically gets RTL (Right-to-Left) text direction via the `dir` attribute in the root layout:

```typescript
<html lang={lng} dir={dir(lng)}>
```

## 📦 Adding New Translations

### Step 1: Add to Translation Files

Add your new key to both language files:

**i18n/locales/en/common.json**
```json
{
  "myNewKey": "My New Text"
}
```

**i18n/locales/ar/common.json**
```json
{
  "myNewKey": "النص الجديد"
}
```

### Step 2: Use in Components

```typescript
const { t } = useTranslation(lng, 'common')
return <div>{t('myNewKey')}</div>
```

## 📚 Creating New Namespaces

If you need a new translation namespace (e.g., for a new feature):

### Step 1: Create Translation Files

Create files for both languages:
- `i18n/locales/en/yournamespace.json`
- `i18n/locales/ar/yournamespace.json`

### Step 2: Use the Namespace

```typescript
// Server component
const { t } = await useTranslation(lng, 'yournamespace')

// Client component
const { t } = useTranslation(lng, 'yournamespace')
```

## 🔗 Updating Links

When creating links, always include the locale:

```typescript
import Link from 'next/link'

// ❌ Wrong
<Link href="/dashboard">Dashboard</Link>

// ✅ Correct
<Link href={`/${lng}/dashboard`}>Dashboard</Link>
```

For role-based routes, use the helper function:

```typescript
import { getLocalizedRoleRoute } from '@/lib/constants'

const dashboardUrl = getLocalizedRoleRoute(user.role, lng)
```

## 🧪 Testing Different Languages

### Method 1: Use Language Switcher
Click on the language buttons in the navbar.

### Method 2: Direct URL
Navigate directly to the route with the desired locale:
- English: `http://localhost:3000/en/p/dashboard`
- Arabic: `http://localhost:3000/ar/p/dashboard`

### Method 3: Set Cookie
Set the `i18next` cookie to your preferred language:
```javascript
document.cookie = 'i18next=ar;path=/;max-age=31536000'
```

## 🐛 Common Issues

### 1. Missing Translation Key
If a key is not found, it will display the key itself. Check:
- The key exists in the translation file
- You're using the correct namespace
- The translation files are properly formatted JSON

### 2. Language Not Changing
- Clear browser cookies
- Check middleware configuration
- Ensure the locale is properly passed to components

### 3. RTL Not Working for Arabic
- Verify the `dir` attribute is set in the HTML element
- Check if CSS is overriding text direction
- Use `text-start` and `text-end` instead of `text-left` and `text-right` in Tailwind

## 📖 Translation Best Practices

1. **Use meaningful keys**: `"welcomeMessage"` not `"msg1"`
2. **Keep related translations together**: Use namespaces effectively
3. **Use interpolation for dynamic content**:
   ```typescript
   // In translation file
   "welcomeMessage": "Welcome back, {{name}}!"
   
   // In component
   t('welcomeMessage', { name: user.name })
   ```
4. **Keep translations consistent**: Use the same terms across the app
5. **Provide context**: Add comments in translation files for complex strings

## 🔧 Configuration Files

### i18n/settings.ts
- Configure supported languages
- Set fallback language
- Define default namespace

### proxy.ts
- Handles locale detection and routing
- Redirects to appropriate locale
- Sets language cookie
- Sets current path header (x-current-path)
- Handles server actions

## 📝 Example: Complete Page Implementation

```typescript
// app/[lng]/my-page/page.tsx
import { useTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'
import { MyClientComponent } from '@/components/MyClientComponent'

type Props = {
  params: { lng: Locale }
}

export default async function MyPage({ params }: Props) {
  const { lng } = params
  const { t } = await useTranslation(lng, 'common')

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <MyClientComponent lng={lng} />
    </div>
  )
}
```

```typescript
// components/MyClientComponent.tsx
'use client'

import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface Props {
  lng: Locale
}

export function MyClientComponent({ lng }: Props) {
  const { t } = useTranslation(lng, 'common')

  return (
    <button onClick={() => alert(t('success'))}>
      {t('submit')}
    </button>
  )
}
```

## 🎉 Summary

Your application now has:
- ✅ Full English and Arabic support
- ✅ Automatic RTL for Arabic
- ✅ Language switcher component
- ✅ Locale-aware routing
- ✅ Server and client component support
- ✅ Comprehensive translations for all major features

Happy internationalizing! 🌍

