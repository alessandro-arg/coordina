import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { createDemoId, getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<(typeof client.api.tasks)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.tasks)["$post"]>;

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const tasksInColumn = demoData.tasks.filter(
          (task) =>
            task.workspaceId === json.workspaceId &&
            task.status === json.status,
        );

        const highestPosition = tasksInColumn.reduce(
          (highest, task) => Math.max(highest, task.position),
          0,
        );

        const taskId = createDemoId("demo-task");

        const task = {
          _id: taskId,
          $id: taskId,
          name: json.name,
          status: json.status,
          workspaceId: json.workspaceId,
          projectId: json.projectId,
          assigneeId: json.assigneeId,
          dueDate:
            json.dueDate instanceof Date
              ? json.dueDate.toISOString()
              : String(json.dueDate),
          description: null,
          position: highestPosition + 1000,
        };

        demoData.tasks.push(task);
        setDemoData(demoData);

        return {
          data: task,
        } as ResponseType;
      }

      const response = await client.api.tasks["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  return mutation;
};
