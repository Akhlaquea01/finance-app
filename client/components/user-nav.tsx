"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { useFinance } from "@/app/context/finance-context"
import storage from "@/utils/storage"

export function UserNav() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const { userData, updateUserData } = useFinance();

  const handleLogout = () => {
    // Clear token from cookies
    Cookies.remove('finTrac_token', {
      secure: true,
      sameSite: 'strict'
    })

    // Clear from storage
    storage.clearToken()
    storage.signOut()
    
    // Update context
    updateUserData(null)

    // Show success message
    toast.success("Logged out successfully")

    // Redirect to login page
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData?.avatar} alt="User" className="h-8 w-8 object-cover rounded-full" />
            <AvatarFallback className="h-8 w-8 flex items-center justify-center">
              {userData?.fullName?.[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userData?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu >
  )
}
