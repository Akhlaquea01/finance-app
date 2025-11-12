import { ArrowDownIcon, ArrowUpIcon, PlusCircle } from "lucide-react";
import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { useState, memo } from "react";
import { NoDataFound } from "./no-data-found";
import { useFinance } from "@/app/context/finance-context";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { AddTransactionModal } from "./modal/add-transaction";

interface RecentTransactionsProps {
  transactions: any[];
  loading: boolean;
}

export const RecentTransactions = memo(function RecentTransactions({
  transactions,
  loading,
}: RecentTransactionsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const [isOpen, setIsOpen] = useState(false);
  const { refreshData } = useFinance();

  const handleAddItem = () => {
    setIsOpen(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  // const totalPages = Math.ceil(transactions?.length / transactionsPerPage);

  return (
    <div className="space-y-4">
      {currentTransactions?.length > 0 ? (
        currentTransactions.map((transaction) => (
          <div key={transaction._id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{transaction.category?.icon}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-md font-bold leading-none">
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.category?.name} •{" "}
                {transaction.account?.accountName}
              </p>
            </div>
            <div className="ml-auto font-medium">
              <div className="flex items-center">
                {transaction.transactionType === "credit" ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    transaction.transactionType === "credit"
                      ? "text-emerald-500"
                      : "text-red-500"
                  )}
                >
                  ₹{transaction.amount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-right text-muted-foreground">
                {dayjs(transaction.date).format("MMM D, YYYY")}
              </p>
            </div>
          </div>
        ))
      ) : (
        <>
          <NoDataFound
            title="No Transactions found"
            description="You haven't added any transactions yet. Click the button below to add your first transaction."
            addButtonText="Add Transaction"
            onAddClick={handleAddItem}
            icon={<PlusCircle className="h-10 w-10 text-muted-foreground" />}
          />
          {isOpen && (
            <AddTransactionModal
              type="credit"
              open={isOpen}
              onClose={() => setIsOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
});
