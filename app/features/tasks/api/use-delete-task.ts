import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$delete"]
>;

export const useDeleteTask = () => {
  const { data: user } = useCurrent();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        demoData.tasks = demoData.tasks.filter(
          (task) => task.$id !== param.taskId,
        );

        setDemoData(demoData);

        return {
          data: {
            $id: param.taskId,
          },
        } as ResponseType;
      }

      const response = await client.api.tasks[":taskId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  return mutation;
};
