"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useTheme } from "next-themes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown } from "lucide-react"
import { format, startOfMonth } from "date-fns"
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
    amount: number
    type: "credit" | "debit"
    description: string
    date: string
}

export default function TransactionsPage() {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
    const [endDate, setEndDate] = useState<Date>(new Date())
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [transactionType, setTransactionType] = useState<'all' | 'credit' | 'debit'>('all')

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false
    })

    const fetchTransactions = async (pageNum: number, reset = false) => {
        if (loading) return
        setLoading(true)
        try {
            const response = await fetchAllTransaction(transactionType, startDate, endDate)
            const newTransactions = response.data?.transactions
            setTransactions(prev => reset ? newTransactions : [...prev, ...newTransactions])
            setHasMore(newTransactions?.length === 10)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    // Reset and fetch first page when filters change
    useEffect(() => {
        setPage(1)
        setTransactions([])
        fetchTransactions(1, true)
    }, [startDate, endDate, transactionType])

    // Load more when scrolling to bottom
    useEffect(() => {
        if (inView && hasMore && !loading) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchTransactions(nextPage)
        }
    }, [inView, hasMore, loading, page])

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
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
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                                        <Skeleton className="h-3 w-16 ml-auto" />
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

            <div ref={ref} className="h-4" />
        </div>
    )
}