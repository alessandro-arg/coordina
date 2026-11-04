import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["join"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["join"]["$post"]
>;

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.workspaces[":workspaceId"]["join"][
        "$post"
      ]({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to join workspace");
      }

      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Successfully joined workspace");

      void queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["workspace", data.$id],
      });

      void queryClient.invalidateQueries({
        queryKey: ["workspace-info"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["workspace-info", data.$id],
      });
    },
    onError: () => {
      toast.error("Failed to join workspace");
    },
  });

  return mutation;
};
