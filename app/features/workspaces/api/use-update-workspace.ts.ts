import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"]
>;

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const workspaceIndex = demoData.workspaces.findIndex(
          (workspace) => workspace.$id === param.workspaceId,
        );

        if (workspaceIndex === -1) {
          throw new Error("Demo workspace not found");
        }

        const currentWorkspace = demoData.workspaces[workspaceIndex];

        const updatedWorkspace = {
          ...currentWorkspace,
          name:
            typeof form.name === "string" && form.name.length > 0
              ? form.name
              : currentWorkspace.name,
          imageUrl:
            typeof form.image === "string" && form.image.length > 0
              ? form.image
              : (currentWorkspace.imageUrl ?? null),
        };

        demoData.workspaces[workspaceIndex] = updatedWorkspace;
        setDemoData(demoData);

        return {
          data: {
            _id: updatedWorkspace.$id,
            ...updatedWorkspace,
          },
        } as ResponseType;
      }

      const response = await client.api.workspaces[":workspaceId"]["$patch"]({
        form,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }

      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Workspace updated successfully");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
      queryClient.invalidateQueries({
        queryKey: ["workspace-info", data.$id],
      });
    },
    onError: () => {
      toast.error("Failed to update workspace");
    },
  });

  return mutation;
};
