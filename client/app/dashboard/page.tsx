"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  CreditCard,
  IndianRupee,
  PiggyBank,
  Wallet,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionSummary } from "@/components/transaction-summary";
import { useFinance } from "@/app/context/finance-context";
import AISuggestionsCard from "@/components/ui/AISuggestionsCard";

export default function DashboardPage() {
  const {
    summary,
    transactions,
    loading,
    error,
    refreshData,
  } = useFinance();

  const [refreshKey, setRefreshKey] = useState(0);

  // Memoized refresh function
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);


  // Force refresh when refreshKey changes
  useEffect(() => {
    refreshData();
  }, [refreshData, refreshKey]);

  // Listen for storage changes to auto-refresh
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('financeDataUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('financeDataUpdated', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-2 sm:p-8 pt-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-2 sm:p-8 pt-6">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-2 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="text-sm sm:text-base">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm sm:text-base">
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Balance
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    ₹ {summary?.netAmount || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {(summary?.netAmount || 0) >= 0 ? 'Surplus' : 'Deficit'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Income
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-500">
                    ₹ {summary?.totalIncome || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Expenses
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-red-500">
                    ₹ {summary?.totalExpense || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                  Credit Card Expenses
                  </CardTitle>
                  <PiggyBank className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-cyan-500">
                    ₹ {summary?.creditCardExpenses || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Expenses this month
                  </p>
                </CardContent>
              </Card>
            </div>
            <TransactionSummary 
              transactions={transactions || []}
              transactionLoading={loading}
            />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <AISuggestionsCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

