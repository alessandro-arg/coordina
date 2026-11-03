import { Metadata } from "next";
import { auth } from "@/auth";
import SignInCard from "@/app/features/auth/components/sign-in-card";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

const SignInPage = async () => {
  const session = await auth();

  if (session?.user) redirect("/");

  return <SignInCard />;
};

export default SignInPage;
