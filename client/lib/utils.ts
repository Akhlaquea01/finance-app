'use client'
import { cn } from "./cn"

export { cn }

export const storage = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  },
}

export function getMonthName(monthNumber: number) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[monthNumber - 1]; // because arrays are 0-indexed
}