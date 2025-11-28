"use client"

import { useEffect, useState, useCallback } from "react"
import { Edit, MoreVertical, Plus, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchCategory, deleteCategory } from "@/app/service/api.service"
import { toast } from "sonner"
import { AddCategoryDialog } from "@/components/add-category-dialog"

type CategoryType = 'debit' | 'credit';

interface Category {
  _id: string;
  name: string;
  transactionType: string;
  description: string;
  color: string;
}

export default function CategoriesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories only - no other API calls
  const fetchCategories = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await fetchCategory();

      // Handle different response structures
      const categoriesData = response?.data?.categories || response?.data || [];

      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        setCategories([]);

        // Retry once if no categories found
        if (retryCount === 0) {
          setTimeout(() => fetchCategories(1), 1000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);

      // Retry once on error
      if (retryCount === 0) {
        setTimeout(() => fetchCategories(1), 2000);
      } else {
        toast.error("Failed to fetch categories");
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully");
      fetchCategories(); // Refresh only categories
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage your transaction categories
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditCategory(null);
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : categories.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No categories found. Create your first category to get started.
                    </TableCell>
                  </TableRow>
                )
                : categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell
                      className={`${category.transactionType === "debit"
                          ? "text-red-600"
                          : "text-green-600"
                        }`}
                    >
                      {category.transactionType === "debit"
                        ? "Debit"
                        : "Credit"}
                    </TableCell>
                    <TableCell>
                      <div
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditCategory(category);
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>

      <AddCategoryDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditCategory(null);
        }}
        editCategory={editCategory}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          setEditCategory(null);
          fetchCategories(); // Refresh only categories
        }}
      />
    </Card>
  );
}
