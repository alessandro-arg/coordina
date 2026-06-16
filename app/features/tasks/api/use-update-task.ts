import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$patch"]
>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const taskIndex = demoData.tasks.findIndex(
          (task) => task.$id === param.taskId,
        );

        if (taskIndex === -1) {
          throw new Error("Demo task not found");
        }

        const currentTask = demoData.tasks[taskIndex];

        const updatedTask = {
          ...currentTask,
          ...(json.name !== undefined && { name: json.name }),
          ...(json.status !== undefined && { status: json.status }),
          ...(json.projectId !== undefined && { projectId: json.projectId }),
          ...(json.assigneeId !== undefined && { assigneeId: json.assigneeId }),
          ...(json.description !== undefined && {
            description: json.description,
          }),
          ...(json.dueDate !== undefined && {
            dueDate:
              json.dueDate instanceof Date
                ? json.dueDate.toISOString()
                : String(json.dueDate),
          }),
        };

        demoData.tasks[taskIndex] = updatedTask;
        setDemoData(demoData);

        return {
          data: {
            _id: updatedTask.$id,
            ...updatedTask,
          },
        } as ResponseType;
      }

      const response = await client.api.tasks[":taskId"]["$patch"]({
        json,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  return mutation;
};
