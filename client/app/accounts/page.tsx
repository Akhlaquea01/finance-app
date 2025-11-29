'use client'
import { useEffect, useState } from "react"
import { CreditCard, Landmark, Plus, Trash, Wallet, LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { deleteAccount, fetchAccountList } from "../service/api.service"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { toast } from "sonner"
import { EditAccountDialog } from "@/components/edit-account-dialog"
import { NoDataFound } from "@/components/no-data-found"

const iconMap: Record<string, LucideIcon> = {
  Landmark: Landmark,
  Wallet: Wallet,
  CreditCard: CreditCard,
}

export default function AccountsPage() {
  const [allAccounts, setAllAccounts] = useState<any[]>([])
  const [openAddAccountDialog, setOpenAddAccountDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const res = await fetchAccountList()
      setAllAccounts(res?.data?.accounts || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error("Failed to fetch accounts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) {
      return
    }
    try {
      await deleteAccount(id)
      toast.success("Account deleted successfully")
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error("Failed to delete account")
    }
  }

  const totalAssets = allAccounts.reduce((sum, account) => {
    if (!account) return sum
    return account.accountType !== "credit_card"
      ? sum + (account.balance || 0)
      : sum - (account.balance || 0)
  }, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-6 sm:mt-4 md:mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Accounts</h2>
          <p className="text-sm text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Button onClick={() => setOpenAddAccountDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Accounts</CardTitle>
          <CardDescription>View and manage your bank accounts, credit cards, and other financial accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20 ml-auto" />
                    <Skeleton className="h-8 w-8 ml-2 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ))}
              <div className="flex items-center border-t pt-4 mt-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28 ml-auto" />
              </div>
            </div>
          ) : allAccounts.length === 0 ? (
            <NoDataFound
              title="No Accounts found"
              description="You haven't added any accounts yet. Click the button above to add your first account."
              addButtonText="Add Account"
              onAddClick={() => setOpenAddAccountDialog(true)}
            />
          ) : (
            <div className="space-y-4">
              {allAccounts.map((account) => {
                if (!account) return null

                const Icon = iconMap[account.iconName] || Wallet
                const balance = account.balance || 0
                const limit = account.limit || 0

                return (
                  <div key={account._id} className="flex flex-col space-y-2 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="flex items-center">
                      <Icon className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="font-medium flex-1">{account.accountName}</span>
                      <span
                        className={`font-medium ${
                          balance < 0 ? "text-red-500" : ""
                        }`}
                      >
                        {account.currency || '₹'}
                        {Math.abs(balance).toFixed(2)}
                      </span>
                      <div className="ml-2 flex items-center gap-1">
                        <EditAccountDialog
                          account={account}
                          onSuccess={fetchAccounts}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteAccount(account._id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>

                    {account.accountType === "credit_card" && limit > 0 && (
                      <div className="space-y-1 ml-7">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Credit Used</span>
                          <span className="text-muted-foreground">
                            {account.currency || '₹'}
                            {Math.abs(balance).toFixed(2)} / {formatCurrency(limit)}
                          </span>
                        </div>
                        <Progress
                          value={(Math.abs(balance) / limit) * 100}
                          className="h-2"
                          indicatorClassName={
                            Math.abs(balance) / limit > 0.8
                              ? "bg-red-500"
                              : "bg-cyan-500"
                          }
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="flex items-center border-t pt-4 mt-4">
                <span className="font-medium">Total Assets</span>
                <span className={`ml-auto font-bold ${
                  totalAssets >= 0 ? "text-emerald-500" : "text-red-500"
                }`}>
                  {formatCurrency(totalAssets)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {openAddAccountDialog && (
        <AddAccountDialog
          open={openAddAccountDialog}
          onClose={() => setOpenAddAccountDialog(false)}
          editAccount={null}
          onSuccess={() => {
            setOpenAddAccountDialog(false)
            fetchAccounts()
          }}
        />
      )}
    </div>
  )
}
