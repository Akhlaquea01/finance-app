"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  MenuIcon,
  PiggyBank,
  TagsIcon,
  XIcon,
  Landmark,
} from "lucide-react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/cn"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { AddActionDropdown } from "./add-action-dropdown"
import storage from "@/utils/storage"
import { Skeleton } from "@/components/ui/skeleton"
import { useFinance } from "@/app/context/finance-context"

interface SiteHeaderProps {
  className?: string
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const pathname = usePathname()
  const { isAuthenticated, isAuthLoading } = useFinance()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  if (isAuthLoading) {
    // Show loading state while checking authentication
    return (
      <header className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3",
        className
      )}>
        <div className="container mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 w-full justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3",
        className
      )}
    >
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile Toggle */}
          <button
            className="md:hidden ml-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
          <Link href="/" className="mr-4 flex items-center space-x-2">
            <span className="font-bold text-2xl sm:text-2xl sm:inline-block">
              FinanceTracker
            </span>
          </Link>

          {isAuthenticated && (
            <>
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center space-x-6 text-sm sm:text-base">
                <Link
                  href="/dashboard"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === "/dashboard"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <span className="flex items-center gap-1">
                    <div
                      className={cn(
                        "flex items-center justify-center bg-transparent p-1 sm:p-1 rounded-full border",
                        pathname === "/dashboard"
                          ? "border-foreground"
                          : "border-gray-300 dark:border-gray-700"
                      )}
                    >
                      <HomeIcon
                        className={cn(
                          "h-3 w-3 sm:h-5 sm:w-5",
                          pathname === "/dashboard"
                            ? "text-foreground"
                            : "text-gray-800 dark:text-gray-100"
                        )}
                      />
                    </div>
                    Dashboard
                  </span>
                </Link>

                <Link
                  href="/categories"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === "/categories"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <span className="flex items-center gap-1">
                    <div
                      className={cn(
                        "flex items-center justify-center bg-transparent p-1 sm:p-1 rounded-full border",
                        pathname === "/categories"
                          ? "border-foreground"
                          : "border-gray-300 dark:border-gray-700"
                      )}
                    >
                      <TagsIcon
                        className={cn(
                          "h-3 w-3 sm:h-5 sm:w-5",
                          pathname === "/categories"
                            ? "text-foreground"
                            : "text-gray-800 dark:text-gray-100"
                        )}
                      />
                    </div>
                    Categories
                  </span>
                </Link>

                <Link
                  href="/accounts"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === "/accounts"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <span className="flex items-center gap-1">
                    <div
                      className={cn(
                        "flex items-center justify-center bg-transparent p-1 sm:p-1 rounded-full border",
                        pathname === "/accounts"
                          ? "border-foreground"
                          : "border-gray-300 dark:border-gray-700"
                      )}
                    >
                      <Landmark
                        className={cn(
                          "h-3 w-3 sm:h-5 sm:w-5",
                          pathname === "/accounts"
                            ? "text-foreground"
                            : "text-gray-800 dark:text-gray-100"
                        )}
                      />
                    </div>
                    Accounts
                  </span>
                </Link>

              </nav>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <AddActionDropdown className="h-9 w-9" />
            <UserNav />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <nav className="flex flex-col space-y-2 text-base mt-2">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-md transition-colors hover:bg-muted",
                pathname === "/dashboard"
                  ? "bg-muted text-foreground"
                  : "text-foreground/70"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <HomeIcon className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/categories"
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-md transition-colors hover:bg-muted",
                pathname === "/categories"
                  ? "bg-muted text-foreground"
                  : "text-foreground/70"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <TagsIcon className="h-5 w-5" />
              Categories
            </Link>
            <Link
              href="/accounts"
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-md transition-colors hover:bg-muted",
                pathname === "/accounts"
                  ? "bg-muted text-foreground"
                  : "text-foreground/70"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Landmark className="h-5 w-5" />
              Accounts
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
