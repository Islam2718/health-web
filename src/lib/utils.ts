import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${base}-${Date.now().toString(36)}`
}

export function firstName(fullName: string) {
  const parts = fullName.split(" ").filter(Boolean)
  const isTitle = /^(dr|mr|mrs|ms|prof)\.?$/i.test(parts[0] ?? "")
  return (isTitle ? parts[1] : parts[0]) ?? fullName
}

export type PasswordStrengthLabel = "Weak" | "Medium" | "Strong"

export interface PasswordStrength {
  label: PasswordStrengthLabel
  score: number
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const label: PasswordStrengthLabel = score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong"
  return { label, score }
}
