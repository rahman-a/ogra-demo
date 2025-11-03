# Barcode Scanner Implementation Guide

## Overview

The passenger dashboard now includes a real barcode scanner using the `html5-qrcode` library. Passengers can scan barcodes (QR codes or linear barcodes) to automatically book seats on active rides.

## Features

### 1. **Real Camera Scanning**

- Uses device camera (back camera by default on mobile)
- Supports QR codes and linear barcodes
- Real-time scanning with visual feedback
- Automatic booking upon successful scan

### 2. **Automatic Booking Flow**

- Scans barcode in format: `routeId:seatId`
- Validates route has an active ride
- Checks passenger wallet balance
- **Automatically books and pays** if sufficient balance
- Shows payment modal if insufficient balance

### 3. **Manual Entry Option**

- Fallback for camera issues
- Input format: `routeId:seatId`
- Example: `clp4abc123:clp4xyz789`

## Installation

The required package is already installed:

```bash
pnpm install html5-qrcode
```

## Barcode Format

### Standard Format

```
routeId:seatId
```

### Example

```
clp4route123:clp4seat456
```

- **routeId**: The UUID/CUID of the route
- **seatId**: The UUID/CUID of the specific seat

## User Flow

### Happy Path (Auto-Booking)

1. Passenger opens dashboard
2. Taps "Scan Barcode to Book"
3. Taps "Open Camera Scanner"
4. Points camera at barcode
5. System scans and validates:
   - Route exists
   - Route has active ride
   - Seat is available
   - Seat not already booked
   - Passenger has enough balance
6. **Automatically books and deducts payment**
7. Shows success message
8. Dashboard refreshes with new booking

### Insufficient Balance Path

1. Steps 1-5 same as above
2. System detects insufficient balance
3. Shows payment modal with:
   - Route details
   - Seat number
   - Required price
   - Current balance
   - "Charge Wallet" button
4. Passenger can charge wallet and retry

### Error Handling

- **No active ride**: "No active ride found for this route"
- **Seat already booked**: "Seat #X is already booked"
- **Already has booking**: "You already have a booking for this ride"
- **Seat unavailable**: "Seat #X is occupied/on_maintenance"
- **Camera issues**: Falls back to manual entry

## Components

### 1. `BarcodeScanner.tsx`

**Location**: `components/passenger/BarcodeScanner.tsx`

**Features**:

- Camera scanner with `html5-qrcode`
- Manual input fallback
- Loading states
- Error handling

**Usage**:

```tsx
<BarcodeScanner
  onScanSuccess={(result) => {
    // Handle successful scan
  }}
  onScanError={(error) => {
    // Handle error
  }}
/>
```

### 2. `ScanBarcode.ts` (Server Action)

**Location**: `actions/ScanBarcode.ts`

**Features**:

- Validates routeId and seatId
- Checks for active rides
- Validates seat availability
- **Auto-books if balance sufficient**
- Creates booking transaction
- Updates seat status
- Deducts from wallet

**Function Signature**:

```typescript
export async function scanBarcode(
  barcodeData: string,
  autoBook: boolean = true
): Promise<ScanResult>
```

**Response**:

```typescript
interface ScanResult {
  success: boolean
  message: string
  autoBooked?: boolean  // true if automatically booked
  data?: {
    route: { ... }
    activeRide: { ... }
    seat?: { ... }
    booking?: { ... }  // Present if auto-booked
  }
}
```

### 3. `PassengerDashboardClient.tsx`

**Location**: `components/passenger/PassengerDashboardClient.tsx`

**Features**:

- Integrates scanner
- Shows success/error messages
- Displays booking history
- Handles auto-booking vs manual payment flow

## Database Schema

### Barcode Data Requirements

The barcode must contain valid IDs from your database:

```prisma
model Route {
  id String @id @default(cuid())
  // ... other fields
}

model Seat {
  id String @id @default(cuid())
  seatNumber Int
  // ... other fields
}
```

## Testing

### Manual Testing Format

For testing, you can use the manual input with actual IDs from your database:

1. Get a route ID from database (e.g., via Prisma Studio)
2. Get a seat ID from that route's vehicle
3. Ensure the route has an active ride (driver started it)
4. Format: `{routeId}:{seatId}`
5. Enter in manual input field

### Example Test Flow

```bash
# 1. Start a ride as driver
# 2. Get the route ID and seat ID
# 3. As passenger, scan: "clp4abc123:clp4xyz789"
# 4. System will auto-book if balance sufficient
```

## Generating QR Codes

To generate QR codes for physical seats, you can use:

### Online Tools

- https://www.qr-code-generator.com/
- Input format: `routeId:seatId`

### Programmatic Generation

```javascript
import QRCode from 'qrcode'

async function generateSeatQR(routeId, seatId) {
  const data = `${routeId}:${seatId}`
  await QRCode.toFile(`seat-${seatId}.png`, data)
}
```

## Security Considerations

1. **Server-side validation**: All validation happens on server (ScanBarcode action)
2. **Authentication required**: User must be logged in
3. **Seat availability checked**: Prevents double booking
4. **Balance verified**: Ensures sufficient funds before booking
5. **Transaction safety**: Uses Prisma transactions for data consistency

## Troubleshooting

### Camera Not Starting

- **Browser permissions**: User must grant camera access
- **HTTPS required**: Camera API only works on HTTPS (or localhost)
- **Fallback**: Manual entry always available

### Barcode Not Scanning

- **Lighting**: Ensure good lighting
- **Distance**: Hold device 10-30cm from barcode
- **Focus**: Wait for camera to focus
- **Fallback**: Use manual entry

### Auto-Booking Not Working

Check:

1. Route has active ride (`status = 'ACTIVE'`)
2. Seat is available (`status = 'AVAILABLE'`)
3. Passenger has sufficient balance
4. Passenger doesn't already have a booking for that ride
5. Seat ID matches a seat in the route's vehicle

## API Reference

### `scanBarcode(barcodeData, autoBook)`

**Parameters**:

- `barcodeData` (string): Format `routeId:seatId` or JSON
- `autoBook` (boolean): Default `true` - auto-book if balance sufficient

**Returns**: `Promise<ScanResult>`

**Behavior**:

- If `autoBook=true` and balance sufficient → Books automatically
- If `autoBook=true` and balance insufficient → Returns data for manual payment
- If `autoBook=false` → Only validates, no booking

## Future Enhancements

1. **NFC Support**: Add NFC tap-to-book functionality
2. **Offline Scanning**: Cache route data for offline validation
3. **Multiple QR Formats**: Support different barcode standards
4. **Seat Selection**: Allow choosing seat if barcode doesn't specify
5. **Payment Integration**: Support external payment gateways
6. **Analytics**: Track scan success rates and common errors

## Support

For issues or questions, please refer to the main application documentation or contact the development team.

---

**Last Updated**: November 3, 2025
**Version**: 1.0.0
