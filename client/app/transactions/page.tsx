"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isAfter, startOfDay } from "date-fns"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { fetchAllTransaction } from "../service/api.service"

interface Transaction {
    _id: string
    transactionType: string
    category: {
        name: string
        icon: string
    }
    account?: {
        _id: string
        accountName: string
        accountType?: string
    }
    amount: number
    type: "credit" | "debit"
    description: string
    date: string
}

export default function TransactionsPage() {
    const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
    const [endDate, setEndDate] = useState<Date>(new Date())
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [transactionType, setTransactionType] = useState<'all' | 'credit' | 'debit'>('all')

    const fetchTransactions = async (reset = false) => {
        if (loading) return
        setLoading(true)
        try {
            const response = await fetchAllTransaction(transactionType, startDate, endDate)
            const newTransactions = response.data?.transactions || []
            
            if (reset) {
                // Reset: replace all transactions
                setTransactions(newTransactions)
            } else {
                // Append: only add new transactions that don't already exist
                setTransactions(prev => {
                    const existingIds = new Set(prev.map((t: Transaction) => t._id))
                    const uniqueNewTransactions = newTransactions.filter((t: Transaction) => !existingIds.has(t._id))
                    return [...prev, ...uniqueNewTransactions]
                })
            }
            
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    // Reset and fetch when filters change
    useEffect(() => {
        fetchTransactions(true)
    }, [startDate, endDate, transactionType])

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    }

    const handlePreviousMonth = () => {
        const newStartDate = startOfMonth(subMonths(startDate, 1))
        const newEndDate = endOfMonth(newStartDate)
        // Don't allow going beyond current month
        const today = startOfDay(new Date())
        if (isAfter(newStartDate, today)) return
        
        setStartDate(newStartDate)
        setEndDate(newEndDate > today ? today : newEndDate)
    }

    const handleNextMonth = () => {
        const newStartDate = startOfMonth(addMonths(startDate, 1))
        const newEndDate = endOfMonth(newStartDate)
        const today = startOfDay(new Date())
        
        // Don't allow going to future months
        if (isAfter(newStartDate, today)) return
        
        setStartDate(newStartDate)
        setEndDate(newEndDate > today ? today : newEndDate)
    }

    // Check if next month button should be disabled
    const isNextMonthDisabled = () => {
        const nextMonthStart = startOfMonth(addMonths(startDate, 1))
        const today = startOfDay(new Date())
        return isAfter(nextMonthStart, today)
    }

    return (
        <div className="space-y-6 sm:mt-4 md:mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold">All Transactions({transactions.length})</h2>
                    <p className="text-sm text-muted-foreground">View and filter your transaction history</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <Tabs
                        defaultValue="all"
                        value={transactionType}
                        onValueChange={(value) => setTransactionType(value as 'all' | 'credit' | 'debit')}
                        className="w-full sm:w-auto"
                    >
                        <TabsList className="w-full sm:w-auto grid grid-cols-3">
                            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                            <TabsTrigger value="credit" className="flex-1">Credit</TabsTrigger>
                            <TabsTrigger value="debit" className="flex-1">Debit</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={handlePreviousMonth}
                            className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <DatePicker
                                selected={startDate}
                                onChange={(date: Date | null) => date && setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={endDate}
                                className="w-full sm:w-[150px] p-2 rounded-md border border-input bg-background text-sm"
                                dateFormat="MMM dd, yyyy"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date: Date | null) => date && setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                className="w-full sm:w-[150px] p-2 rounded-md border border-input bg-background text-sm"
                                dateFormat="MMM dd, yyyy"
                            />
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
            </div>

            <div className="space-y-4">
                {transactions?.map((transaction) => (
                    <Card key={transaction._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${transaction.transactionType === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                        {transaction.transactionType === 'credit' ? (
                                            <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{transaction.category?.name}</p>
                                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${transaction.transactionType === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatAmount(transaction.amount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                    </p>
                                    {transaction.account && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {transaction.account.accountName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div>
                                            <Skeleton className="h-4 w-32 mb-2" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Skeleton className="h-4 w-20 mb-2 ml-auto" />
                                        <Skeleton className="h-3 w-16 mb-1 ml-auto" />
                                        <Skeleton className="h-3 w-20 ml-auto" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && transactions?.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found</p>
                </div>
            )}
        </div>
    )
}