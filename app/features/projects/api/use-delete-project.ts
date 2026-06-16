import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.projects)[":projectId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)[":projectId"]["$delete"]
>;

export const useDeleteProject = () => {
  const { data: user } = useCurrent();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        demoData.projects = demoData.projects.filter(
          (project) => project.$id !== param.projectId,
        );

        demoData.tasks = demoData.tasks.filter(
          (task) => task.projectId !== param.projectId,
        );

        setDemoData(demoData);

        return {
          data: {
            $id: param.projectId,
          },
        } as ResponseType;
      }

      const response = await client.api.projects[":projectId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  return mutation;
};
