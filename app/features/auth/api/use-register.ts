import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.account.register)["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api.account.register)["$post"]
>;

export const useRegister = () => {
  const router = useRouter();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.account.register.$post({ json });

      if (!response.ok) {
        let message = "Failed to register";

        try {
          const error = await response.json();
          if ("error" in error && typeof error.error === "string") {
            message = error.error;
          }
        } catch {
          message = `Failed to register (${response.status})`;
        }

        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Account created. Please log in.");
      router.push("/sign-in");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
