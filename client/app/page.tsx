import Link from "next/link"
import { BarChart3, CreditCard, DollarSign, LineChart, PiggyBank, Shield, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Take Control of Your Financial Future
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  FinanceTracker helps you manage your money with ease. Track expenses and achieve your
                  financial goals.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-3xl opacity-20"></div>
                <div className="relative bg-card border rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Wallet className="h-8 w-8 text-emerald-500 mr-2" />
                        <h3 className="text-xl font-bold">FinanceTracker</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Balance</p>
                        <p className="text-2xl font-bold">₹5,231.89</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            <p className="text-sm font-medium">Income</p>
                          </div>
                          <p className="text-lg font-bold text-emerald-500">+₹3,500.00</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4 text-red-500" />
                            <p className="text-sm font-medium">Expenses</p>
                          </div>
                          <p className="text-lg font-bold text-red-500">-₹1,892.50</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need to Manage Your Finances
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our comprehensive suite of tools helps you track, plan, and optimize your financial life.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <BarChart3 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">Expense Tracking</h3>
                  <p className="text-muted-foreground">
                    Easily log and categorize your expenses to understand where your money goes.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                    <PiggyBank className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold">Financial Insights</h3>
                  <p className="text-muted-foreground">
                    Visualize your financial data with charts and reports to make informed decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <LineChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Financial Insights</h3>
                  <p className="text-muted-foreground">
                    Visualize your financial data with charts and reports to make informed decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Wallet className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Account Management</h3>
                  <p className="text-muted-foreground">
                    Track all your financial accounts in one place for a complete overview of your finances.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold">Income Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor your income sources and analyze your earning patterns over time.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold">Secure & Private</h3>
                  <p className="text-muted-foreground">
                    Your financial data is encrypted and secure, giving you peace of mind.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Take Control?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Start managing your finances today and build a better financial future.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
