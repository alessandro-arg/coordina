"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import DottedSeparator from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";
import { signInWithGithub, signInWithGoogle } from "@/lib/server/oauth";

export default function SignUpCard() {
  const { mutate, isPending } = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border border-border shadow-lg">
      <CardHeader className="flex flex-col items-start justify-start text-left p-7 pb-0">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create an account
        </CardTitle>

        <CardDescription className="text-muted-foreground text-sm mt-1">
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent className="p-7 pt-2 space-y-6">
        {/* OAuth buttons side by side */}
        <div className="grid grid-cols-2 gap-3">
          <form action={signInWithGithub}>
            <Button
              type="submit"
              disabled={isPending}
              variant="outline"
              size="lg"
              className="w-full font-medium"
            >
              <FaGithub className="mr-2 size-4" />
              GitHub
            </Button>
          </form>
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              disabled={isPending}
              variant="outline"
              size="lg"
              className="w-full font-medium"
            >
              <FcGoogle className="mr-2 size-4" />
              Google
            </Button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground tracking-widest">
              Or continue with
            </span>
          </div>
        </div>

        {/* Name / Email / Password form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pb-1">Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="John Doe"
                      className="bg-input/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pb-1">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="user@example.com"
                      className="bg-input/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pb-1">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="bg-input/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} size="lg" className="w-full mt-1">
              Create account
            </Button>
          </form>
        </Form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
