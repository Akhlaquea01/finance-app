'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Skeleton } from './skeleton';
import { fetchAiSuggestion } from '@/app/service/api.service';
import dayjs from 'dayjs';

const AISuggestionsCard: React.FC = () => {
    const firstDay = dayjs().startOf('month'); // e.g., 2025-04-01
    const lastDay = dayjs().endOf('month'); // e.g., 2025-04-30

    const [smartSuggestions, setSmartSuggestions] = React.useState<string[]>([])
    const [spendingPatterns, setSpendingPatterns] = React.useState<string[]>([])
    const [accountOptimization, setAccountOptimization] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        getAiSuggetion()
    }, [])

    const getAiSuggetion = async () => {
        try {
            setLoading(true);
            const res = await fetchAiSuggestion({
              startDate: firstDay.format("YYYY-MM-DD"),
              endDate: lastDay.format("YYYY-MM-DD"),
            });
            setSmartSuggestions(res?.data?.suggestions?.smartSuggestions || [])
            setSpendingPatterns(res?.data?.suggestions.spendingPatternsDetected || [])
            setAccountOptimization(res?.data?.suggestions?.accountOptimization || [])
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false);
        }
    }
    // Loading state
    if (loading || (!smartSuggestions.length && !spendingPatterns.length && !accountOptimization.length)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>🤖 Smart Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-auto flex items-center justify-center">
                        <div className="w-full">
                            <div className="rounded-xl p-4 space-y-6">
                                {/* Skeleton for Smart Tips */}
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <div className="space-y-2 pl-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                </div>

                                {/* Skeleton for Spending Patterns */}
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <div className="space-y-2 pl-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                </div>

                                {/* Skeleton for Account Optimization */}
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-44" />
                                    <div className="space-y-2 pl-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>🤖 Smart Suggestions</CardTitle>
                {/* <CardDescription>Compare your income and expenses over time.</CardDescription> */}
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-auto flex items-center justify-center">
                    <div className="w-full">
                        <div className="rounded-xl p-4">
                            {/* Smart Tips */}
                            <Section title="💡 Smart Tips" items={smartSuggestions} />

                            {/* Spending Patterns */}
                            <Section title="📊 Spending Patterns Detected" items={spendingPatterns} />

                            {/* Account Optimization */}
                            <Section title="🧩 Account Optimization" items={accountOptimization} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

    );
};

type SectionProps = {
    title: string;
    items: string[];
};

const Section: React.FC<SectionProps> = ({ title, items }) => {
    return (
        <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default AISuggestionsCard;


