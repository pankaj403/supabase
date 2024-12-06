import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  // Return empty string if phone is null or undefined
  if (!phone) return ''

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Handle +61 prefix
  if (cleaned.startsWith('61')) {
    const number = cleaned.slice(2)
    if (number.length === 9) {
      return `+61${number}`
    }
  }
  
  // Handle 0 prefix
  if (cleaned.startsWith('0')) {
    const number = cleaned.slice(1)
    if (number.length === 9) {
      return `+61${number}`
    }
  }

  // If already in correct format
  if (cleaned.length === 9) {
    return `+61${cleaned}`
  }
  
  // Return original if invalid
  return phone
}

export function validateAustralianPhone(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Valid formats:
  // 1. +61XXXXXXXXX (12 digits with +)
  // 2. 61XXXXXXXXX (11 digits)
  // 3. 0XXXXXXXXX (10 digits)
  // 4. XXXXXXXXX (9 digits)
  
  // Check if starts with +61, 61, or 0
  if (cleaned.startsWith('61')) {
    return cleaned.length === 11 && /^61[2-9]\d{8}$/.test(cleaned)
  }
  
  if (cleaned.startsWith('0')) {
    return cleaned.length === 10 && /^0[2-9]\d{8}$/.test(cleaned)
  }
  
  // Allow just the 9 digits
  return cleaned.length === 9 && /^[2-9]\d{8}$/.test(cleaned)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function parseDuration(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number)
  return (minutes * 60) + (seconds || 0)
}