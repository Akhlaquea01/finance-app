"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { fetchAccountStatsSummary } from "@/app/service/api.service"
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PiggyBank, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Percent,
  Calendar,
  Wallet
} from "lucide-react"

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

  // Helper functions
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

  // Calculate additional insights
  const insights = useMemo(() => {
    if (!summaryData) {
      return {
        savingsRate: 0,
        expenseRate: 0,
        creditCardUtilization: 0,
        topExpenseCategory: null,
        topIncomeCategory: null,
        savingsChange: 0,
        savingsChangePercent: 0,
        ccExpenseChange: 0,
        ccExpenseChangePercent: 0,
        ccOutstanding: 0,
        prevCcOutstanding: 0
      }
    }

    const savingsRate = summaryData.totalIncome > 0 
      ? ((summaryData.netAmount / summaryData.totalIncome) * 100) 
      : 0
    
    const expenseRate = summaryData.totalIncome > 0
      ? ((summaryData.totalExpense / summaryData.totalIncome) * 100)
      : 0

    const creditCardUtilization = summaryData.totalExpense > 0
      ? ((summaryData.creditCardExpenses / summaryData.totalExpense) * 100)
      : 0

    const topExpenseCategory = summaryData.categoryWiseExpense?.length > 0
      ? summaryData.categoryWiseExpense.reduce((prev, current) => 
          (prev.amount > current.amount) ? prev : current
        )
      : null

    const topIncomeCategory = summaryData.categoryWiseIncome?.length > 0
      ? summaryData.categoryWiseIncome.reduce((prev, current) => 
          (prev.amount > current.amount) ? prev : current
        )
      : null

    // Month-over-month changes
    const savingsChange = summaryData.netAmount - summaryData.lastMonthSavings
    const savingsChangePercent = summaryData.lastMonthSavings !== 0
      ? ((savingsChange / Math.abs(summaryData.lastMonthSavings)) * 100)
      : 0

    const ccExpenseChange = summaryData.creditCardExpenses - summaryData.prevMonthCreditCardExpenses
    const ccExpenseChangePercent = summaryData.prevMonthCreditCardExpenses !== 0
      ? ((ccExpenseChange / summaryData.prevMonthCreditCardExpenses) * 100)
      : 0

    const ccOutstanding = summaryData.creditCardExpenses - summaryData.creditCardPayments
    const prevCcOutstanding = summaryData.prevMonthCreditCardExpenses - summaryData.prevMonthCreditCardPayments

    return {
      savingsRate,
      expenseRate,
      creditCardUtilization,
      topExpenseCategory,
      topIncomeCategory,
      savingsChange,
      savingsChangePercent,
      ccExpenseChange,
      ccExpenseChangePercent,
      ccOutstanding,
      prevCcOutstanding
    }
  }, [summaryData])

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

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${insights.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {insights.savingsRate.toFixed(1)}%
            </div>
            <Progress 
              value={Math.min(Math.abs(insights.savingsRate), 100)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {insights.savingsRate >= 20 ? 'Excellent savings!' : 
               insights.savingsRate >= 10 ? 'Good savings' : 
               insights.savingsRate >= 0 ? 'Low savings' : 'Spending more than income'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {insights.expenseRate.toFixed(1)}%
            </div>
            <Progress 
              value={Math.min(insights.expenseRate, 100)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Of total income spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Card Usage</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {insights.creditCardUtilization.toFixed(1)}%
            </div>
            <Progress 
              value={Math.min(insights.creditCardUtilization, 100)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Of total expenses via credit card
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Month Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Month-over-Month Comparison
          </CardTitle>
          <CardDescription>
            How this month compares to last month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Savings Trend</span>
                {insights.savingsChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className={`text-xl font-bold ${insights.savingsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {insights.savingsChange >= 0 ? '+' : ''}{formatCurrency(insights.savingsChange)}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.abs(insights.savingsChangePercent).toFixed(1)}% {insights.savingsChange >= 0 ? 'increase' : 'decrease'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CC Spending Trend</span>
                {insights.ccExpenseChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className={`text-xl font-bold ${insights.ccExpenseChange >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {insights.ccExpenseChange >= 0 ? '+' : ''}{formatCurrency(insights.ccExpenseChange)}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.abs(insights.ccExpenseChangePercent).toFixed(1)}% {insights.ccExpenseChange >= 0 ? 'increase' : 'decrease'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CC Outstanding</span>
                <Wallet className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-purple-600">
                {formatCurrency(insights.ccOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                Prev: {formatCurrency(insights.prevCcOutstanding)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Expense Categories
            </CardTitle>
            <CardDescription>
              {insights.topExpenseCategory && (
                <>Top: {insights.topExpenseCategory.category} ({formatCurrency(insights.topExpenseCategory.amount)})</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData.categoryWiseExpense && summaryData.categoryWiseExpense.length > 0 ? (
                summaryData.categoryWiseExpense.map((item, index) => {
                  const percentage = summaryData.totalExpense > 0 ? (item.amount / summaryData.totalExpense) * 100 : 0
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <span className="font-medium text-red-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })
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
              Income Categories
            </CardTitle>
            <CardDescription>
              {insights.topIncomeCategory && (
                <>Top: {insights.topIncomeCategory.category} ({formatCurrency(insights.topIncomeCategory.amount)})</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData.categoryWiseIncome && summaryData.categoryWiseIncome.length > 0 ? (
                summaryData.categoryWiseIncome.map((item, index) => {
                  const percentage = summaryData.totalIncome > 0 ? (item.amount / summaryData.totalIncome) * 100 : 0
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <span className="font-medium text-green-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-sm">No income categories found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Card Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Credit Card Summary
          </CardTitle>
          <CardDescription>
            Detailed credit card spending and payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This Month Expenses</p>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(summaryData.creditCardExpenses)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Payments Made</p>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(summaryData.creditCardPayments)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <div className="text-xl font-bold text-orange-600">
                {formatCurrency(insights.ccOutstanding)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Month Expenses</p>
              <div className="text-xl font-bold text-muted-foreground">
                {formatCurrency(summaryData.prevMonthCreditCardExpenses)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-blue-600" />
            Financial Insights - {getMonthName(summaryData.month)} {summaryData.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(summaryData.totalIncome)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(summaryData.totalExpense)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Net Amount</p>
              <div className={`text-xl font-bold ${summaryData.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summaryData.netAmount)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Month Savings</p>
              <div className={`text-xl font-bold ${summaryData.lastMonthSavings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(summaryData.lastMonthSavings)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
