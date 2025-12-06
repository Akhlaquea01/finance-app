"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  Edit, 
  MoreVertical, 
  Plus, 
  Trash, 
  Tag
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { fetchCategory, deleteCategory } from "@/app/service/api.service"
import { toast } from "sonner"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { NoDataFound } from "@/components/no-data-found"


interface Category {
  _id: string;
  name: string;
  transactionType: string;
  description: string;
  color: string;
  icon?: string;
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
    <div className="space-y-6 sm:mt-4 md:mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">Manage your transaction categories</p>
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

      {loading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <Card key={index}>
                <CardContent className="p-3 pl-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : categories.length === 0 ? (
        <NoDataFound
          title="No Categories found"
          description="You haven't created any categories yet. Click the button above to add your first category."
          addButtonText="Add Category"
          onAddClick={() => {
            setEditCategory(null);
            setIsAddDialogOpen(true);
          }}
        />
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="group relative overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border hover:border-primary/20"
            >
              {/* Left color accent bar */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ 
                  backgroundColor: category.color
                }}
              />
              
              <CardContent className="p-3 pl-4">
                <div className="flex items-center gap-3">
                  {/* Icon on the left */}
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 flex-shrink-0"
                    style={{ 
                      backgroundColor: category.color
                    }}
                  >
                    {category.icon ? (
                      <span className="text-lg drop-shadow-sm">{category.icon}</span>
                    ) : (
                      <Tag className="h-5 w-5 text-white drop-shadow-sm" />
                    )}
                  </div>
                  
                  {/* Name and badge on the right */}
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground line-clamp-1 leading-tight">
                        {category.name}
                      </h3>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={
                            category.transactionType === "debit"
                              ? "border-red-300 text-red-700 bg-red-50 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400 font-medium px-2 py-0.5 text-xs"
                              : "border-green-300 text-green-700 bg-green-50 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400 font-medium px-2 py-0.5 text-xs"
                          }
                        >
                          {category.transactionType === "debit" ? "Debit" : "Credit"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Menu button */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted rounded-md flex-shrink-0"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditCategory(category);
                            setIsAddDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
          fetchCategories();
        }}
      />
    </div>
  );
}
