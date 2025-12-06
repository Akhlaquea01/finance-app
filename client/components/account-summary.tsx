"use client";
import { CreditCard, Landmark, Wallet, LucideIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EditAccountDialog } from "@/components/edit-account-dialog";
import { NoDataFound } from "./no-data-found";
import { useState, memo } from "react";
import { AddAccountDialog } from "./modal/add-account";

interface Account {
  _id: string;
  name: string;
  balance: number;
  type: string;
  iconName: string;
  limit?: number;
  accountName: string;
  accountType: string;
  currency: string;
}

const iconMap: Record<string, LucideIcon> = {
  Landmark: Landmark,
  Wallet: Wallet,
  CreditCard: CreditCard,
};

interface AccountSummaryProps {
  allAccounts?: Account[];
  loading: boolean;
}

export const AccountSummary = memo(function AccountSummary({
  allAccounts = [],
  loading,
}: AccountSummaryProps) {
  const [openAddAccount, setOpenAddAccount] = useState(false);
  const totalAssets = allAccounts.reduce((sum, account) => {
    if (!account) return sum;
    return account.accountType !== "credit_card"
      ? sum + (account.balance || 0)
      : sum - (account.balance || 0);
  }, 0);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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
    );
  }

  return (
    <div className="space-y-4">
      {allAccounts.length > 0 ? (
        allAccounts.map((account: any) => {
          if (!account) return null;

          const Icon = iconMap[account.iconName] || Wallet;
          const balance = account.balance || 0;
          const limit = account.limit || 0;

          return (
            <div key={account._id} className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Icon className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{account.accountName}</span>
                <span
                  className={`ml-auto font-medium ${
                    balance < 0 ? "text-red-500" : ""
                  }`}
                >
                  {account.currency}
                  {Math.abs(balance).toFixed(2)}
                </span>
                <div className="ml-2">
                  <EditAccountDialog account={account} />
                </div>
              </div>

              {account.accountType === "credit_card" && limit > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Credit Used</span>
                    <span className="text-muted-foreground">
                      {account.currency}
                      {Math.abs(balance).toFixed(2)} /{limit.toFixed(2)}
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
          );
        })
      ) : (
        <>
          <NoDataFound
            title="No Accounts found"
            description="You haven't added any accounts yet. Click the button below to add your first account."
            addButtonText="Add Account"
            onAddClick={() => {
              setOpenAddAccount(true);
            }}
          />
          {openAddAccount && (
            <AddAccountDialog
              open={openAddAccount}
              onClose={() => setOpenAddAccount(false)}
              editAccount={null}
            />
          )}
        </>
      )}

      <div className="flex items-center border-t pt-4 mt-2">
        <span className="font-medium">Total Assets</span>
        <span className="ml-auto font-bold text-emerald-500">
          ₹{totalAssets.toFixed(2)}
        </span>
      </div>
    </div>
  );
});
