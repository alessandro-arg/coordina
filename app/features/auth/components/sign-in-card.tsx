"use client";

import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { signInWithGithub, signInWithGoogle } from "@/lib/server/oauth";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const DEMO_WORKSPACE_ID = "demo-workspace-1";

const handleDemoLogin = async () => {
  const result = await signIn("credentials", {
    email: "demo@coordina.app",
    password: "irgendwas-langes",
    redirect: false,
  });

  if (result?.error) {
    toast.error("Demo login failed");
    return;
  }

  toast.success("Logged in as Demo User");

  window.location.href = `/workspaces/${DEMO_WORKSPACE_ID}?demo=true`;
};

export default function SignInCard() {
  const { mutate, isPending } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate(values);
  };

  return (
    <Card className="w-full h-full md:w-[487px] border border-border shadow-lg">
      <CardHeader className="flex flex-col items-start justify-start text-left p-7 pb-0">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>

        <div className="mt-4 rounded-lg border border-primary/60 p-4">
          <p className="font-medium">Want to test the application?</p>

          <p className="text-sm text-muted-foreground mt-1">
            Use the demo workspace and explore all features instantly. No
            account required.
          </p>

          <Button
            type="button"
            className="mt-3 w-full"
            onClick={handleDemoLogin}
          >
            Open Demo Workspace
          </Button>
        </div>
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

        {/* Email / Password form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
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
              Sign in
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
