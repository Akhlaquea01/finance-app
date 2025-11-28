"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { loginUser } from "@/app/service/api.service"
import storage from "@/utils/storage"
import { useFinance } from "@/app/context/finance-context"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(4, "Password must be at least 4 characters"),
})

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { updateUserData } = useFinance()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })


    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        try {
            setIsLoading(true);
            const res = await loginUser(data);
            
            // Extract tokens from response
            const accessToken = res?.data?.accessToken;
            const refreshToken = res?.data?.refreshToken;
            const user = res?.data?.user;
            
            if (accessToken && user) {
                // Store tokens properly
                storage.setToken({
                    accessToken,
                    refreshToken
                });
                storage.setUser(user);
                updateUserData(user);
                
                toast.success("Logged in successfully");
                
                // Get callback URL from query params or default to dashboard
                const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
                
                // Use window.location for hard navigation to ensure middleware re-runs
                window.location.href = callbackUrl;
            } else {
                toast.error("Invalid response from server");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            toast.error(err?.message || "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
            <div className="w-full max-w-[400px] space-y-6 rounded-lg border border-border/50 bg-card p-6 shadow-lg">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to sign in to your account
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>

                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/signup"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Don&apos;t have an account? Sign up
                    </Link>
                </p>
            </div>
        </main>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
                <div className="w-full max-w-[400px] space-y-6 rounded-lg border border-border/50 bg-card p-6 shadow-lg">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Loading...</h1>
                    </div>
                </div>
            </main>
        }>
            <LoginForm />
        </Suspense>
    )
}