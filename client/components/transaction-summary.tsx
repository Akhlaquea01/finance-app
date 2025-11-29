"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { fetchAccountStatsSummary } from "@/app/service/api.service"
import { RecentTransactions } from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
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
  Wallet,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format, startOfMonth, addMonths, subMonths, isAfter, startOfDay } from "date-fns"

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

interface TransactionSummaryProps {
  transactions?: any[]
  transactionLoading?: boolean
}

export function TransactionSummary({ transactions = [], transactionLoading = false }: TransactionSummaryProps) {
  const [summaryData, setSummaryData] = useState<TransactionSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfMonth(new Date()))

  const currentMonth = selectedDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
  const currentYear = selectedDate.getFullYear()

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchAccountStatsSummary(currentMonth, currentYear)
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
  }, [currentMonth, currentYear])

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

  const handlePreviousMonth = () => {
    const newDate = startOfMonth(subMonths(selectedDate, 1))
    const today = startOfDay(new Date())
    if (isAfter(newDate, today)) return
    setSelectedDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = startOfMonth(addMonths(selectedDate, 1))
    const today = startOfDay(new Date())
    if (isAfter(newDate, today)) return
    setSelectedDate(newDate)
  }

  const isNextMonthDisabled = () => {
    const nextMonthStart = startOfMonth(addMonths(selectedDate, 1))
    const today = startOfDay(new Date())
    return isAfter(nextMonthStart, today)
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
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Summary</h3>
          <p className="text-sm text-muted-foreground">Financial overview and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="px-4 py-2 rounded-md border border-input bg-background text-sm font-medium min-w-[140px] text-center">
            {format(selectedDate, 'MMMM yyyy')}
          </div>
          <button
            onClick={handleNextMonth}
            disabled={isNextMonthDisabled()}
            className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Financial Insights & Month-over-Month Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-blue-600" />
            Financial Insights - {getMonthName(summaryData.month)} {summaryData.year}
          </CardTitle>
          <CardDescription>
            Month-over-Month Comparison - How this month compares to last month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Month-over-Month Comparison */}
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Month-over-Month Comparison
            </h4>
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
          </div>

          {/* Financial Summary */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold mb-4">Financial Summary</h4>
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
          </div>

          {/* Credit Card Summary */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              Credit Card Summary
            </h4>
            <p className="text-xs text-muted-foreground mb-4">Detailed credit card spending and payment information</p>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{format(selectedDate, 'MMMM yyyy')} Expenses</p>
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
                <p className="text-sm text-muted-foreground">{format(subMonths(selectedDate, 1), 'MMMM yyyy')} Expenses</p>
                <div className="text-xl font-bold text-muted-foreground">
                  {formatCurrency(summaryData.prevMonthCreditCardExpenses)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Recent Transactions - Moved here from dashboard */}
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            You made {transactions?.length || 0} transactions this month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions
            transactions={transactions || []}
            loading={transactionLoading}
          />
        </CardContent>
        {transactions && transactions.length > 0 && (
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/transactions">
                View All Transactions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Top Categories - Moved to bottom */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                Expense Categories
              </CardTitle>
              {insights.topExpenseCategory && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Top Category</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(insights.topExpenseCategory.amount)}
                  </p>
                </div>
              )}
            </div>
            {insights.topExpenseCategory && (
              <CardDescription className="pt-2 text-sm">
                {insights.topExpenseCategory.category}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {summaryData.categoryWiseExpense && summaryData.categoryWiseExpense.length > 0 ? (
                summaryData.categoryWiseExpense.map((item, index) => {
                  const percentage = summaryData.totalExpense > 0 ? (item.amount / summaryData.totalExpense) * 100 : 0
                  return (
                    <div key={index} className="group hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-md p-3 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
                          <span className="font-medium text-sm text-foreground truncate">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="font-bold text-red-600 dark:text-red-400 text-sm tabular-nums">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2 bg-red-100 dark:bg-red-950/50" 
                        indicatorClassName="bg-gradient-to-r from-red-500 to-red-600"
                      />
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No expense categories found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Income Categories
              </CardTitle>
              {insights.topIncomeCategory && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Top Category</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(insights.topIncomeCategory.amount)}
                  </p>
                </div>
              )}
            </div>
            {insights.topIncomeCategory && (
              <CardDescription className="pt-2 text-sm">
                {insights.topIncomeCategory.category}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {summaryData.categoryWiseIncome && summaryData.categoryWiseIncome.length > 0 ? (
                summaryData.categoryWiseIncome.map((item, index) => {
                  const percentage = summaryData.totalIncome > 0 ? (item.amount / summaryData.totalIncome) * 100 : 0
                  return (
                    <div key={index} className="group hover:bg-green-50/50 dark:hover:bg-green-950/20 rounded-md p-3 transition-all border border-transparent hover:border-green-200 dark:hover:border-green-900">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div>
                          <span className="font-medium text-sm text-foreground truncate">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400 text-sm tabular-nums">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2 bg-green-100 dark:bg-green-950/50" 
                        indicatorClassName="bg-gradient-to-r from-green-500 to-green-600"
                      />
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No income categories found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
