import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["bulk-update"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["bulk-update"]["$post"]
>;

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const updatedTasks = json.tasks.map((taskUpdate) => {
          const taskIndex = demoData.tasks.findIndex(
            (task) => task.$id === taskUpdate.$id,
          );

          if (taskIndex === -1) {
            return null;
          }

          const updatedTask = {
            ...demoData.tasks[taskIndex],
            status: taskUpdate.status,
            position: taskUpdate.position,
          };

          demoData.tasks[taskIndex] = updatedTask;

          return {
            _id: updatedTask.$id,
            ...updatedTask,
          };
        });

        setDemoData(demoData);

        return {
          data: updatedTasks.filter(Boolean),
        } as ResponseType;
      }

      const response = await client.api.tasks["bulk-update"]["$post"]({
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to update tasks");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Tasks updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
    },
    onError: () => {
      toast.error("Failed to update tasks");
    },
  });

  return mutation;
};
