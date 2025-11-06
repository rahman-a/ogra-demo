feat: Implement comprehensive i18n localization (English/Arabic) with full RTL support

BREAKING CHANGE: Application routes now require locale prefix (e.g., /en/dashboard, /ar/dashboard)

## Major Features

### 1. Complete i18n Infrastructure
- Set up i18next and react-i18next for server and client components
- Created translation namespace structure (common, auth, dashboard, rides, wallet, landing, actions)
- Implemented locale detection via cookies and browser headers
- Added locale-based routing with [lng] dynamic segment
- Created helper functions for locale retrieval in server actions

### 2. Full Application Translation
- **Landing Page**: Complete translation of hero, features, testimonials, and footer
- **Authentication Pages**: Translated signin/signup forms with validation messages
- **Passenger Dashboard**: 
  - Dashboard overview, profile, wallet, rides list
  - Barcode scanner, payment modal, navigation components
- **Driver Dashboard**:
  - Main dashboard, active ride management, profile management
  - Vehicle and route registration forms
  - Wallet and transaction history
- **Error Pages**: Translated 403 error page

### 3. RTL (Right-to-Left) Support
- Implemented proper arrow direction for back buttons (ArrowLeft for LTR, ArrowRight for RTL)
- Currency symbol localization (E£ for English, ج.م for Arabic)
- Adjusted input padding and text alignment for RTL layouts
- Fixed navigation arrows in passenger wallet, profile, and rides pages
- Fixed navigation arrows in driver dashboard, active ride, profile, vehicle, and route pages

### 4. Server Actions Translation
- Translated all success and error messages in 18 action files:
  - WalletActions, UpdatePassengerProfile, ManualBooking, ScanBarcode
  - BookSeat, CancelBooking, ChargeWallet, WithdrawMoney, TransferMoney
  - AssignSeat, UpdateSeatStatus, Registration, RegisterVehicle, RegisterRoute
  - StartRide, CompleteRide, UpdateProfile, BookSeat
- Created `actions.json` translation namespace with comprehensive error/success messages
- Implemented locale retrieval from cookies in server actions via `getLocaleFromCookies()`

### 5. Authentication Translation
- Translated NextAuth credential signin error messages
- Error messages now display in user's selected language

### 6. Component Updates
- **Navbar**: Added language switcher and translated menu items
- **Logout Button**: Translated logout text
- **Language Switcher**: Created dropdown and simple button variants
- All form components now support locale prop and display translated content

## Technical Changes

### File Structure
- Restructured app directory to use `[lng]` dynamic segment for locale routing
- Moved all pages under `app/[lng]/` structure
- Updated all layout files to handle locale parameters
- Created `i18n/` directory with settings, client/server initialization, and translation files

### Configuration
- Updated `next.config.ts` for i18n support
- Modified `proxy.ts` to handle locale detection and redirection (replaced middleware.ts)
- Added `lib/get-locale.ts` helper for server-side locale retrieval
- Updated `lib/constants.ts` with localized route helpers

### Dependencies
- Added: i18next, react-i18next, i18next-resources-to-backend, accept-language

## Translation Files Created
- `i18n/locales/en/common.json` - Common UI elements
- `i18n/locales/en/auth.json` - Authentication pages
- `i18n/locales/en/dashboard.json` - Dashboard content (passenger & driver)
- `i18n/locales/en/actions.json` - Server action messages
- `i18n/locales/en/landing.json` - Landing page content
- `i18n/locales/en/rides.json` - Rides-related content
- `i18n/locales/en/wallet.json` - Wallet-related content
- Corresponding Arabic (`ar/`) versions for all above files

## Bug Fixes
- Fixed ERR_TOO_MANY_REDIRECTS by removing conflicting redirect logic
- Fixed translation key mismatches throughout driver dashboard
- Fixed back button arrow directions for RTL support
- Fixed currency symbol placement for Arabic locale
- Fixed TypeScript errors with Next.js 16 params handling

## Migration Notes
- All routes now require locale prefix (e.g., `/en/dashboard` or `/ar/dashboard`)
- Root routes automatically redirect to locale-prefixed routes
- Locale is stored in `i18next` cookie and detected from browser headers
- Server actions automatically use locale from cookies for error/success messages

