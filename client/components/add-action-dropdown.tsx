"use client"

import { Plus, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
// Removed AddAccountDialog import - accounts can be added from accounts page
import { AddTransactionDialog } from "./add-transaction-dialog"
import { AddCategoryDialog } from "./add-category-dialog"
import { useState } from "react"
import { AddTransferModal } from "./modal/add-transfer"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface AddActionDropdownProps {
    className?: string
}

export function AddActionDropdown({ className }: AddActionDropdownProps) {
    const [openTransfer, setOpenTransfer] = useState(false)
    const [open, setOpen] = useState(false);

    return (
      <>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${className} aspect-square rounded-full hover:bg-accent`}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add new</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <AddTransactionDialog type="credit" onOpenChange={setOpen} />
            <AddTransactionDialog type="debit" onOpenChange={setOpen} />
            <DropdownMenuItem
              onClick={() => {
                setOpenTransfer(true);
                setOpen(false);
              }}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2 text-blue-500" />
              Transfer
            </DropdownMenuItem>
            {/* Removed Add Account - can be added from accounts page */}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Removed AddAccountDialog - accounts can be added from accounts page */}
        <AddTransferModal
          open={openTransfer}
          onClose={() => setOpenTransfer(false)}
        />
      </>
    );
}
