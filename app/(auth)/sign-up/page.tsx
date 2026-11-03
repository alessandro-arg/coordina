import { Metadata } from "next";
import { auth } from "@/auth";
import SignUpCard from "@/app/features/auth/components/sign-up-card";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign up",
  robots: {
    index: false,
    follow: false,
  },
};

const SignUpPage = async () => {
  const session = await auth();
  if (session?.user) redirect("/");

  return <SignUpCard />;
};

export default SignUpPage;
