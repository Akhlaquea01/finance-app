"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { createCategory, updateCategory } from "@/app/service/api.service"

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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useFinance } from "@/app/context/finance-context"

interface Category {
    id: string
    name: string
    type: CategoryType
    // description: string
    color: string
}

interface AddCategoryDialogProps {
    open: boolean
    onClose: () => void
    editCategory: any
    onSuccess: () => void
}

type CategoryType = "debit" | "credit"

type FormValues = {
    name: string
    type: CategoryType
    description: string
    color: string
}

const formSchema = yup.object({
    name: yup.string().required("Category name is required"),
    type: yup.string().oneOf(["debit", "credit"] as const).required("Category type is required"),
    // description: yup.string().required("Description is required"),
    color: yup.string().required("Color is required")
}).required()

export function AddCategoryDialog({ open, onClose, editCategory, onSuccess }: AddCategoryDialogProps) {
    const { refreshData } = useFinance()

    const form = useForm<FormValues>({
        resolver: yupResolver(formSchema) as any,
        defaultValues: {
            name: editCategory?.name || "",
            type: editCategory?.type || "debit",
            // description: editCategory?.description || "",
            color: editCategory?.color || "#000000"
        }
    })

    useEffect(() => {
        if (editCategory) {
            form.reset({
                name: editCategory.name,
                type: editCategory.transactionType,
                // description: editCategory.description,
                color: editCategory.color
            })
        }
    }, [editCategory, form])

    const onSubmit = async (values: FormValues) => {
        try {
            if (editCategory) {
                await updateCategory(editCategory._id, values)
                toast.success("Category updated successfully")
                refreshData()
                form.reset()
            } else {
                await createCategory(values)
                toast.success("Category created successfully")
                refreshData()
                form.reset()
            }
            onSuccess()
            
            // Dispatch custom event to refresh dashboard
            window.dispatchEvent(new CustomEvent('financeDataUpdated'));
        } catch (error) {
            toast.error(editCategory ? "Failed to update category" : "Failed to create category")
            onClose()
        }
    }

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editCategory ? "Edit" : "Add"} Category</DialogTitle>
            <DialogDescription>
              {editCategory ? "Edit" : "Add"} a category to organize your
              transactions.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="debit">Expense</SelectItem>
                        <SelectItem value="credit">Income</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter category description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {editCategory ? "Update" : "Save"} Category
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
}
