"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ArrowDownRight, ArrowUpRight } from "lucide-react"
import dayjs from "dayjs"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFinance } from "@/app/context/finance-context";
import { createTransaction } from "@/app/service/api.service";
import { toast } from "sonner";
import ThemedCalendar from "@/components/ui/themed-calendar";

const formSchema = yup.object({
  transactionType: yup
    .string()
    .required("Transaction type is required")
    .oneOf(["credit", "debit"], "Transaction type is required"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .typeError("Amount must be a number"),
  description: yup.string().required("Description is required"),
  categoryId: yup.string().required("Category is required"),
  date: yup.date().required("Date is required").typeError("Invalid date"),
  accountId: yup.string().required("Account is required"),
});

interface AddTransactionDialogProps {
  className?: string;
  type: "credit" | "debit";
  onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({
  className,
  type = "debit",
  onOpenChange,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { categories, accounts, userData, refreshData, refreshCategories, clearCategoriesCache, loading } = useFinance();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // Refresh categories when dialog opens
  useEffect(() => {
    if (open) {
      if (!categories || categories.length === 0) {
        console.log("Dialog opened, refreshing categories...");
        refreshCategories();
      } else {
        console.log("Categories already loaded:", categories.length);
      }
    }
  }, [open, categories, refreshCategories]);

  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      transactionType: type,
      amount: 0,
      description: "",
      categoryId: "",
      date: new Date(),
      accountId: "",
    },
  });

  async function onSubmit(values: any) {
    const payload = {
      ...values,
      userId: userData?._id,
      date: dayjs(values.date).format("YYYY-MM-DD"),
    };
    // In a real app, you would save the transaction to your database here
    try {
      const res = await createTransaction(payload);
      refreshData();
      form.reset();
      toast.success("Transaction Added Successfully");
      setOpen(false);
      
      // Dispatch custom event to refresh dashboard
      window.dispatchEvent(new CustomEvent('financeDataUpdated'));
    } catch (error) {
      console.log(error, "error");
    }
  }

  const transactionType = form.watch("transactionType");
  const filteredCategories = categories?.filter(
    (category) => category.transactionType === transactionType
  );

  // Debug logging
  console.log("Categories:", categories);
  console.log("Transaction Type:", transactionType);
  console.log("Filtered Categories:", filteredCategories);
  console.log("Categories length:", categories?.length);
  console.log("Loading state:", loading);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {type === "credit" ? (
            <>
              <ArrowDownRight className="h-4 w-4 text-emerald-500" />
              Add Income
            </>
          ) : (
            <>
              <ArrowUpRight className="h-4 w-4 text-red-500" />
              Add Expense
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction to track your finances.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="credit"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant={
                            field.value === "credit" ? "default" : "outline"
                          }
                          className={cn(
                            field.value === "credit" &&
                              "bg-emerald-600 hover:bg-emerald-700 text-white"
                          )}
                          onClick={() =>
                            form.setValue("transactionType", "credit")
                          }
                        >
                          Income
                        </Button>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="debit"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant={
                            field.value === "debit" ? "default" : "outline"
                          }
                          className={cn(
                            field.value === "debit" &&
                              "bg-red-600 hover:bg-red-700 text-white"
                          )}
                          onClick={() =>
                            form.setValue("transactionType", "debit")
                          }
                        >
                          Expense
                        </Button>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  {loading || !categories || categories.length === 0 ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(filteredCategories && filteredCategories.length > 0 ? filteredCategories : categories)
                          .map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("MMMM D, YYYY")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <ThemedCalendar
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  {loading || accounts.length === 0 ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account._id} value={account._id}>
                            {account.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className={
                  transactionType === "credit"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                Add {transactionType === "credit" ? "Income" : "Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
