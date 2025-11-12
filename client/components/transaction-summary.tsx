"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { fetchAccountStatsSummary } from "@/app/service/api.service"
import { IndianRupee, TrendingUp, TrendingDown, CreditCard, PiggyBank } from "lucide-react"

interface TransactionSummaryData {
  month: number
  year: number
  startDate: string
  endDate: string
  totalIncome: number
  totalExpense: number
  netAmount: number
  lastMonthSavings: number
  creditCardExpenses: number
  creditCardPayments: number
  prevMonthCreditCardExpenses: number
  prevMonthCreditCardPayments: number
  categoryWiseExpense: Array<{
    category: string
    amount: number
  }>
  categoryWiseIncome: Array<{
    category: string
    amount: number
  }>
}

export function TransactionSummary() {
  const [summaryData, setSummaryData] = useState<TransactionSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchAccountStatsSummary()
        console.log('Full API Response:', response)
        console.log('Response data:', response.data)
        console.log('Response data.data:', response.data?.data)
        
        // Handle the response structure - data might be nested
        const summaryData = response.data?.data || response.data
        console.log('Final summary data:', summaryData)
        setSummaryData(summaryData)
      } catch (err) {
        console.error('Failed to fetch transaction summary:', err)
        setError('Failed to load transaction summary')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!summaryData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No summary data available</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summaryData.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getMonthName(summaryData.month)} {summaryData.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summaryData.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getMonthName(summaryData.month)} {summaryData.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summaryData.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summaryData.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryData.netAmount >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Card</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summaryData.creditCardExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Expenses this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Breakdown */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Category-wise Expenses
            </CardTitle>
            <CardDescription>
              Breakdown of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData.categoryWiseExpense.length > 0 ? (
                summaryData.categoryWiseExpense.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {item.category}
                      </Badge>
                    </div>
                    <span className="font-medium text-red-600">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No expense categories found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Category-wise Income
            </CardTitle>
            <CardDescription>
              Breakdown of income by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData.categoryWiseIncome.length > 0 ? (
                summaryData.categoryWiseIncome.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {item.category}
                      </Badge>
                    </div>
                    <span className="font-medium text-green-600">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No income categories found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-blue-600" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summaryData.lastMonthSavings)}
              </div>
              <p className="text-sm text-muted-foreground">Last Month Savings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summaryData.creditCardPayments)}
              </div>
              <p className="text-sm text-muted-foreground">Credit Card Payments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summaryData.prevMonthCreditCardExpenses)}
              </div>
              <p className="text-sm text-muted-foreground">Prev Month CC Expenses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
