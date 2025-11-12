"use client"

/// <reference lib="dom" />

import { useState } from "react"
import { useRouter } from "next/navigation"
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
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { authService } from "@/app/service/auth.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .min(5, "Password must be at least 5 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    avatar: z.any()
        .refine((files) => {
            if (!files || files.length === 0) return true;
            return files[0]?.size <= MAX_FILE_SIZE;
        }, "Max file size is 5MB.")
        .refine((files) => {
            if (!files || files.length === 0) return true;
            return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
        }, "Only .jpg, .jpeg, .png and .webp formats are supported.")
        .optional()
})

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            password: "",
        },
    })

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    async function onSubmit(values: z.infer<typeof signupSchema>) {
        try {
            setIsLoading(true)
            const formData = new FormData()
            formData.append('fullName', values.fullName)
            formData.append('username', values.username)
            formData.append('email', values.email)
            formData.append('password', values.password)
            if (values.avatar && values.avatar?.length > 0) {
                formData.append('avatar', values.avatar[0])
            }

            await authService.signup(formData)
            toast.success("Account created successfully")
            router.push("/login")
            router.refresh()
        } catch (error:any) {
            toast.error(error.message||'Something went wrong!')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
            <div className="w-full max-w-[400px] space-y-6 rounded-lg border border-border/50 bg-card p-6 shadow-lg">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your details to create your account
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem className="flex flex-col items-center space-y-4">
                                    <FormLabel className="cursor-pointer">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={avatarPreview || ""} />
                                            <AvatarFallback className="text-sm">AVATAR</AvatarFallback>
                                        </Avatar>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                onChange(e.target.files)
                                                handleAvatarChange(e)
                                            }}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Click to upload your profile picture
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="johndoe" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This will be your unique identifier
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                    <FormDescription>
                                        Must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                </Form>

                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/login"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Already have an account? Sign in
                    </Link>
                </p>
            </div>
        </main>
    )
}