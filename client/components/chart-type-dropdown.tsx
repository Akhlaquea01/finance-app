"use client"

import { BarChart, LineChart, PieChart, AreaChart } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ChartTypeDropdownProps {
    currentType: string
    onTypeChange: (type: string) => void
    className?: string
}

export function ChartTypeDropdown({ currentType, onTypeChange, className }: ChartTypeDropdownProps) {
    const chartTypes = [
        { id: 'bar', label: 'Bar Chart', icon: BarChart },
        { id: 'line', label: 'Line Chart', icon: LineChart },
        { id: 'pie', label: 'Pie Chart', icon: PieChart },
        { id: 'area', label: 'Area Chart', icon: AreaChart },
    ]

    const CurrentIcon = chartTypes.find(type => type.id === currentType)?.icon || BarChart

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={className}>
                    <CurrentIcon className="h-4 w-4 mr-2" />
                    {chartTypes.find(type => type.id === currentType)?.label || 'Select Chart'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 px-[10px]">
                {chartTypes.map((type) => (
                    <DropdownMenuItem
                        key={type.id}
                        onClick={() => onTypeChange(type.id)}
                        className="cursor-pointer"
                    >
                        <type.icon className="h-4 w-4 mr-2" />
                        {type.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}