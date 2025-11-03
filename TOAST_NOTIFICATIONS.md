# Toast Notifications Implementation

## Overview

Implemented **Sonner** toast notifications throughout the barcode scanner and booking flow for better user feedback and experience.

## Installation

```bash
pnpm install sonner
```

✅ **Installed**: `sonner@2.0.7`

## Setup

### Toaster Component

Added to passenger layout: `app/(passenger)/layout.tsx`

```tsx
import { Toaster } from 'sonner'

;<Toaster position='top-center' richColors closeButton />
```

**Configuration**:

- **Position**: `top-center` - Centered at top of screen (mobile-friendly)
- **Rich Colors**: Enabled - Uses contextual colors (green for success, red for error, etc.)
- **Close Button**: Enabled - Users can manually dismiss toasts

## Toast Notifications by Flow

### 1. Camera Scanner Flow

#### Camera Ready

```tsx
toast.success('Camera ready', {
  description: 'Point your camera at the barcode',
  duration: 3000,
})
```

**Trigger**: Camera successfully initialized
**Type**: Success (green)
**Duration**: 3 seconds

#### Camera Access Denied

```tsx
toast.error('Camera access denied', {
  description:
    'Failed to start camera. Please use manual entry or check permissions.',
  duration: 5000,
})
```

**Trigger**: Camera permission denied or failed to start
**Type**: Error (red)
**Duration**: 5 seconds

#### Barcode Detected

```tsx
toast.success('Barcode detected!', {
  description: 'Validating and processing...',
  duration: 2000,
})
```

**Trigger**: QR/barcode successfully scanned
**Type**: Success (green)
**Duration**: 2 seconds

### 2. Barcode Processing Flow

#### Processing Barcode (Loading)

```tsx
const loadingToast = toast.loading('Processing barcode...')
```

**Trigger**: Started processing barcode
**Type**: Loading (animated spinner)
**Duration**: Until dismissed

#### Scan Failed

```tsx
toast.error('Scan failed', {
  description: result.message, // e.g., "Route not found", "Seat already booked"
  duration: 5000,
})
```

**Trigger**: Validation failed (invalid route, seat unavailable, etc.)
**Type**: Error (red)
**Duration**: 5 seconds

#### Processing Failed

```tsx
toast.error('Processing failed', {
  description: 'Failed to process barcode. Please try again.',
  duration: 5000,
})
```

**Trigger**: Exception during processing
**Type**: Error (red)
**Duration**: 5 seconds

#### Route Validated (No Auto-Book)

```tsx
toast.info('Route validated', {
  description: result.message,
  duration: 3000,
})
```

**Trigger**: Validation success but no auto-booking (insufficient balance)
**Type**: Info (blue)
**Duration**: 3 seconds

#### Seat Booked Successfully (Auto-Book)

```tsx
toast.success('Seat booked successfully!', {
  description: result.message,
  duration: 5000,
})
```

**Trigger**: Auto-booking successful
**Type**: Success (green)
**Duration**: 5 seconds

### 3. Dashboard Flow

#### Booking Confirmed

```tsx
toast.success('🎉 Booking confirmed!', {
  description: `${result.message} - Refreshing dashboard...`,
  duration: 3000,
})
```

**Trigger**: Auto-booking completed in dashboard
**Type**: Success (green) with emoji
**Duration**: 3 seconds

#### Insufficient Balance Warning

```tsx
toast.warning('Insufficient balance', {
  description: 'Please charge your wallet to complete booking.',
  duration: 5000,
})
```

**Trigger**: Scan successful but insufficient balance
**Type**: Warning (yellow)
**Duration**: 5 seconds

### 4. Payment Modal Flow

#### Payment Successful

```tsx
toast.success('🎉 Payment successful!', {
  description: `Seat #${seatNumber} booked successfully`,
  duration: 4000,
})
```

**Trigger**: Manual payment completed successfully
**Type**: Success (green) with emoji
**Duration**: 4 seconds

#### Payment Failed

```tsx
toast.error('Payment failed', {
  description: errorMessage,
  duration: 5000,
})
```

**Trigger**: Payment processing error
**Type**: Error (red)
**Duration**: 5 seconds

## Error Messages by Scenario

### Barcode Format Errors

- **"Invalid barcode format. Expected format: routeId:seatId"**
  - Trigger: Missing or invalid format
- **"Seat ID missing in barcode. Expected format: routeId:seatId"**
  - Trigger: Only route ID provided, no seat ID

### Route Validation Errors

- **"Route not found or inactive"**
  - Trigger: Route doesn't exist or deleted
- **"No active ride found for this route"**
  - Trigger: Route exists but no active ride

### Seat Validation Errors

- **"Seat not found"**
  - Trigger: Seat ID doesn't exist
- **"Seat #X is already booked"**
  - Trigger: Seat taken by another passenger
- **"Seat 1 is reserved for the driver"**
  - Trigger: Attempting to book driver's seat
- **"Seat #X is occupied/on_maintenance"**
  - Trigger: Seat not available

### Booking Errors

- **"You already have a booking for this ride"**
  - Trigger: Duplicate booking attempt
- **"No available seats on this ride"**
  - Trigger: Ride is full
- **"Insufficient balance. Required: E£X, Available: E£Y"**
  - Trigger: Wallet balance too low

### System Errors

- **"Failed to process barcode"**
  - Trigger: Unexpected exception
- **"Failed to start camera. Please use manual entry."**
  - Trigger: Camera initialization failed
- **"Failed to book seat automatically"**
  - Trigger: Auto-booking transaction failed

## Toast Types & Usage

### Success Toast

```tsx
toast.success(title, {
  description: 'Details...',
  duration: 3000,
})
```

**Use for**: Successful operations, confirmations

### Error Toast

```tsx
toast.error(title, {
  description: 'Error details...',
  duration: 5000,
})
```

**Use for**: Failures, validation errors, exceptions

### Warning Toast

```tsx
toast.warning(title, {
  description: 'Warning details...',
  duration: 5000,
})
```

**Use for**: Insufficient balance, non-blocking issues

### Info Toast

```tsx
toast.info(title, {
  description: 'Information...',
  duration: 3000,
})
```

**Use for**: Informational messages, validation success

### Loading Toast

```tsx
const toastId = toast.loading(message)
// Later dismiss:
toast.dismiss(toastId)
```

**Use for**: Async operations, processing states

## Best Practices

### Duration Guidelines

- **Success**: 3-4 seconds
- **Error/Warning**: 5 seconds
- **Info**: 3 seconds
- **Loading**: Until operation completes

### Message Structure

```tsx
toast.type(title, {
  description: 'Detailed explanation',
  duration: milliseconds,
})
```

- **Title**: Short, action-oriented (e.g., "Payment successful")
- **Description**: More context, next steps, or error details

### User Experience

1. **Loading State**: Always show loading toast for async operations
2. **Dismiss Previous**: Dismiss loading toasts before showing result
3. **Actionable**: Include next steps in error messages
4. **Consistent**: Use same patterns throughout app
5. **Mobile-Friendly**: Top-center position doesn't block content

## Debugging

### Console Logs

Kept for development:

```typescript
console.log('barcodeData before: ', barcodeData)
console.log('scan result: ', result)
console.log('scan error: ', errorMessage)
```

These help debug issues without relying only on toasts.

## Removed Components

### Inline Error/Success Messages

Removed from `PassengerDashboardClient.tsx`:

- ✅ Success message banner (replaced with toast)
- ✅ Error message banner (replaced with toast)

**Benefits**:

- Cleaner UI
- Less visual clutter
- Better mobile experience
- Consistent notifications

## Future Enhancements

1. **Custom Toast Styles**: Match brand colors
2. **Toast Actions**: Add "Undo" or "View Details" buttons
3. **Toast Queue**: Limit simultaneous toasts
4. **Persistent Toasts**: For critical errors
5. **Toast Sounds**: Audio feedback for mobile
6. **Toast Position**: User preference setting

## Testing Checklist

- [x] Camera permission granted → Success toast
- [x] Camera permission denied → Error toast
- [x] Barcode detected → Success toast
- [x] Valid barcode + sufficient balance → Auto-book success toast
- [x] Valid barcode + insufficient balance → Warning toast + payment modal
- [x] Invalid route ID → Error toast
- [x] Seat already booked → Error toast
- [x] No active ride → Error toast
- [x] Manual payment success → Success toast
- [x] Manual payment failure → Error toast
- [x] Processing error → Error toast

## Sonner Features Used

- ✅ `toast.success()` - Success messages
- ✅ `toast.error()` - Error messages
- ✅ `toast.warning()` - Warning messages
- ✅ `toast.info()` - Informational messages
- ✅ `toast.loading()` - Loading states
- ✅ `toast.dismiss()` - Dismiss toasts
- ✅ `richColors` - Contextual colors
- ✅ `closeButton` - Manual dismiss
- ✅ `description` - Additional details
- ✅ `duration` - Custom durations

## Resources

- **Sonner Docs**: https://sonner.emilkowal.ski/
- **NPM Package**: https://www.npmjs.com/package/sonner
- **GitHub**: https://github.com/emilkowalski/sonner

---

**Last Updated**: November 3, 2025
**Version**: 1.0.0
