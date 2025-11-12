'use client'

import { WalletIcon } from "lucide-react"
import { cn } from "@/lib/cn"

interface SiteFooterProps {
  className?: string
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("border-t py-6 md:py-0", className)}>
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <div className="flex items-center gap-2 text-sm">
          <WalletIcon className="h-4 w-4" />
          <p>© 2025 FinanceTracker. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
