import { auth } from "@/auth";
import SignUpCard from "@/app/features/auth/components/sign-up-card";
import { redirect } from "next/navigation";

const SignUpPage = async () => {
  const session = await auth();

  if (session?.user) redirect("/");

  return <SignUpCard />;
};

export default SignUpPage;
