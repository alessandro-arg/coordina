import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { createDemoId, getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<(typeof client.api.workspaces)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.workspaces)["$post"]>;

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const workspaceId = createDemoId("demo-workspace");

        const workspace = {
          _id: workspaceId,
          $id: workspaceId,
          name: String(form.name ?? "Demo Workspace"),
          imageUrl:
            typeof form.image === "string" && form.image.length > 0
              ? form.image
              : null,
          inviteCode: createDemoId("invite"),
          userId: user.id,
        };

        demoData.workspaces.push(workspace);

        setDemoData(demoData);

        return {
          data: workspace,
        } as ResponseType;
      }

      const response = await client.api.workspaces["$post"]({ form });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      return response.json();
    },

    onSuccess: () => {
      toast.success("Workspace created");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },

    onError: () => {
      toast.error("Failed to create workspace");
    },
  });

  return mutation;
};
