"use client"

import { useState } from "react"
import { Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { updateAccount } from "@/app/service/api.service"
import { toast } from "sonner"
// Removed useFinance import - will use callback instead

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  type: z.string().min(1, { message: "Type is required." }),
  balance: z.string().min(1, { message: "Balance is required." }),
  limit: z.string().optional(),
})

const accountTypes = [
  { id: "bank", label: "Bank Account" },
  { id: "credit_card", label: "Credit Card" },
  { id: "demat", label: "Investment Account" },
  { id: "wallet", label: "Wallet" },
  { id: "cash", label: "Cash" },
  { id: "other", label: "Others" }
]

type Account = {
  _id: string
  name: string
  balance: number
  type: string
  iconName: string
  limit?: number
  accountName: string
  accountType: string
}

export function EditAccountDialog({ account, onSuccess }: { account: Account; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  // Removed useFinance - will use callback instead

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account.accountName,
      type: account.accountType.toString(),
      balance: account.balance.toString(),
      limit: account.limit?.toString() || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        accountName: values.name,
        accountType: values.type,
        balance: parseFloat(values.balance),
        ...(values.limit ? { limit: parseFloat(values.limit) } : {}),
      };

      // Close dialog first
      setOpen(false);

      // Update account
      await updateAccount(account._id, payload);

      // Show success message
      toast.success("Account updated successfully");

      // Call success callback to refresh data
      onSuccess?.();
      
      // Dispatch custom event to refresh dashboard
      window.dispatchEvent(new CustomEvent('financeDataUpdated'));
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account");
      setOpen(true); // Reopen dialog on error
    }
  }

  const accountType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Make changes to your financial account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        ₹
                      </span>
                      <Input
                        placeholder="0.00"
                        {...field}
                        className="pl-7"
                        type="number"
                        step="0.01"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {accountType === "credit" && (
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          ₹
                        </span>
                        <Input
                          placeholder="0.00"
                          {...field}
                          className="pl-7"
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
