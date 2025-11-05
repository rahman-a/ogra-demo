import { customAlphabet } from 'nanoid'

/**
 * Generates a unique 14-digit numeric code for seat identification
 * Uses nanoid with a custom numeric alphabet for guaranteed uniqueness
 *
 * @returns A string containing exactly 14 digits
 */
export function generateSeatCode(): string {
  // Create a nanoid generator with only numeric characters (0-9)
  const nanoid = customAlphabet('0123456789', 14)

  // Generate and return a 14-digit code
  return nanoid()
}

/**
 * Validates if a string is a valid 14-digit seat code
 *
 * @param code - The code to validate
 * @returns true if the code is exactly 14 digits, false otherwise
 */
export function isValidSeatCode(code: string): boolean {
  return /^\d{14}$/.test(code)
}
