import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";
import { TaskStatus } from "../../tasks/types";

interface useGetProjectAnalyticsProps {
  projectId: string;
}

export type ProjectAnalyticsResponseType = InferResponseType<
  (typeof client.api.projects)[":projectId"]["analytics"]["$get"],
  200
>;

export const useGetProjectAnalytics = ({
  projectId,
}: useGetProjectAnalyticsProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["project-analytics", projectId, user?.isDemo],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const tasks = demoData.tasks.filter(
          (task) => task.projectId === projectId,
        );

        const completedTasks = tasks.filter(
          (task) => task.status === TaskStatus.DONE,
        );

        const incompleteTasks = tasks.filter(
          (task) => task.status !== TaskStatus.DONE,
        );

        const overdueTasks = tasks.filter(
          (task) =>
            task.status !== TaskStatus.DONE &&
            new Date(task.dueDate).getTime() < Date.now(),
        );

        const assignedTasks = tasks.filter(
          (task) => task.assigneeId === "demo-member-1",
        );

        return {
          taskCount: tasks.length,
          taskDifference: tasks.length,

          assignedTaskCount: assignedTasks.length,
          assignedTaskDifference: assignedTasks.length,

          completedTaskCount: completedTasks.length,
          completedTaskDifference: completedTasks.length,

          incompleteTaskCount: incompleteTasks.length,
          incompleteTaskDifference: incompleteTasks.length,

          overdueTaskCount: overdueTasks.length,
          overdueTaskDifference: overdueTasks.length,
        };
      }

      const response = await client.api.projects[":projectId"][
        "analytics"
      ].$get({
        param: { projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project analytics");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!projectId && user !== undefined,
  });

  return query;
};
