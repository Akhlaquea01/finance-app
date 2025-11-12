"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { FileX2, Plus } from "lucide-react";

interface NoDataFoundProps {
  title?: string;
  description?: string;
  addButtonText?: string;
  onAddClick?: () => void;
  icon?: React.ReactNode;
  isActionRequired?: boolean;
}

export function NoDataFound({
  title = "No data found",
  description = "There are no items to display at the moment.",
  addButtonText = "Add New",
  onAddClick = () => {},
  icon,
  isActionRequired = true,
}: NoDataFoundProps) {
  console.log(isActionRequired);
  console.log();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center border rounded-lg border-dashed">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 rounded-full bg-muted">
          {icon || <FileX2 className="h-10 w-10 text-muted-foreground" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        </div>
        {isActionRequired && (
          <Button onClick={onAddClick}>
            <Plus />
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
