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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
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
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm"
            >
              {/* Top color accent bar with gradient */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ 
                  background: `linear-gradient(90deg, ${category.color}, ${category.color}dd)`
                }}
              />
              
              <CardContent className="p-6 pt-7">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden"
                    style={{ 
                      backgroundColor: category.color,
                      boxShadow: `0 10px 30px 0 ${category.color}60`
                    }}
                  >
                    {category.icon ? (
                      <span className="text-2xl drop-shadow-lg z-10 relative">{category.icon}</span>
                    ) : (
                      <Tag className="h-7 w-7 text-white drop-shadow-lg z-10 relative" />
                    )}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-300"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
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
                
                <h3 className="font-bold text-lg mb-3.5 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200 leading-tight min-h-[3.5rem]">
                  {category.name}
                </h3>
                
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className={
                      category.transactionType === "debit"
                        ? "border-red-300 text-red-700 bg-red-50 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400 font-semibold px-3 py-1 text-xs"
                        : "border-green-300 text-green-700 bg-green-50 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400 font-semibold px-3 py-1 text-xs"
                    }
                  >
                    {category.transactionType === "debit" ? "Debit" : "Credit"}
                  </Badge>
                  {category.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 flex-1 min-w-0">
                      {category.description}
                    </p>
                  )}
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
