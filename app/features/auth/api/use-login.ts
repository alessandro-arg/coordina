import { toast } from "sonner";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

type LoginValues = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const router = useRouter();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        console.log("LOGIN RESULT:", result);
        throw new Error(result?.error ?? "Invalid email or password");
      }

      return result;
    },
    onSuccess: () => {
      setIsRedirecting(true);
      toast.success("Logged in successfully");
      router.push("/");
      router.refresh();
    },
    onError: () => {
      toast.error("Invalid email or password");
    },
  });

  return {
    ...mutation,
    isPending: mutation.isPending || isRedirecting,
  };
};
