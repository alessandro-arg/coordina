import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await signOut({
        callbackUrl: "/sign-in",
      });
    },
    onSuccess: () => {
      toast.success("Logged out correctly");
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error("Failed to log out");
    },
  });

  return mutation;
};
