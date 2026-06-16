import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

interface useGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ taskId }: useGetTaskProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["task", taskId, user?.isDemo],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const task = demoData.tasks.find((task) => task.$id === taskId);

        if (!task) {
          throw new Error("Demo task not found");
        }

        const project = demoData.projects.find(
          (project) => project.$id === task.projectId,
        );

        const assignee = demoData.members.find(
          (member) => member.$id === task.assigneeId,
        );

        return {
          ...task,
          project,
          assignee,
        };
      }

      const response = await client.api.tasks[":taskId"].$get({
        param: { taskId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!taskId && user !== undefined,
  });

  return query;
};
