"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { WalletIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount, updateAccount } from "@/app/service/api.service";
import { toast } from "sonner";
import storage from "@/utils/storage";
import { useFinance } from "@/app/context/finance-context";

const accountTypes = [
  { id: "bank", label: "Bank Account" },
  { id: "credit_card", label: "Credit Card" },
  { id: "demat", label: "Investment Account" },
  { id: "wallet", label: "Wallet" },
  { id: "cash", label: "Cash" },
  { id: "other", label: "Others" },
];

const formSchema = z.object({
  accountName: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  accountType: z.string({
    required_error: "Please select an account type.",
  }),
  balance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Balance must be a valid number.",
  }),
  accountNumber: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Account number must be a valid number.",
  }),
  limit: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return !isNaN(Number(val));
      },
      {
        message: "Credit limit must be a valid number.",
      }
    ),
});

export function AddAccountDialog({
  open,
  onClose,
  editAccount,
}: {
  open: boolean;
  onClose: () => void;
  editAccount: any;
}) {
  const userData = storage.getUser();
  const { refreshData } = useFinance();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountName: editAccount?.accountName || "",
      accountType: editAccount?.accountType || "",
      balance: editAccount?.accountBalance || "0",
      accountNumber: editAccount?.accountNumber || "",
      limit: editAccount?.limit || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      accountType: values.accountType,
      balance: values.balance,
      accountName: values.accountName,
      accountNumber: values.accountNumber,
      currency: "₹",
      userId: userData?._id,
      isDefault: false,
      ...(values.limit !== undefined &&
      values.limit !== null &&
      values.limit !== ""
        ? { limit: values.limit }
        : {}),
    };
    try {
      const res = await (editAccount
        ? updateAccount(editAccount._id, payload)
        : createAccount(payload));
      refreshData();
      onClose();
      toast.success(editAccount ? "Account updated successfully" : "Account created successfully");
      form.reset();
    } catch (error) {
      console.log(error, "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <WalletIcon className="h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Add a new account to track your finances. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Account Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Account Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountType"
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
                  <FormLabel>Initial Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("accountType") === "credit_card" && (
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter credit limit"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit">Add Account</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
