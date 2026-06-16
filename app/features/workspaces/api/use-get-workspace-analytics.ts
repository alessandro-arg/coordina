import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";
import { TaskStatus } from "../../tasks/types";

interface useGetWorkspaceAnalyticsProps {
  workspaceId: string;
}

export type WorkspaceAnalyticsResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["analytics"]["$get"],
  200
>;

export const useGetWorkspaceAnalytics = ({
  workspaceId,
}: useGetWorkspaceAnalyticsProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["workspace-analytics", workspaceId, user?.isDemo],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const tasks = demoData.tasks.filter(
          (task) => task.workspaceId === workspaceId,
        );

        const assignedTasks = tasks.filter(
          (task) => task.assigneeId === "demo-member-1",
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

      const response = await client.api.workspaces[":workspaceId"][
        "analytics"
      ].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace analytics");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!workspaceId && user !== undefined,
  });

  return query;
};
