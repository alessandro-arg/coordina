import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

interface useGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  search,
  assigneeId,
  dueDate,
}: useGetTasksProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
      user?.isDemo,
    ],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        let rows = demoData.tasks.filter(
          (task) => task.workspaceId === workspaceId,
        );

        if (projectId) {
          rows = rows.filter((task) => task.projectId === projectId);
        }

        if (status) {
          rows = rows.filter((task) => task.status === status);
        }

        if (search) {
          rows = rows.filter((task) =>
            task.name.toLowerCase().includes(search.toLowerCase()),
          );
        }

        if (assigneeId) {
          rows = rows.filter((task) => task.assigneeId === assigneeId);
        }

        if (dueDate) {
          const selectedDate = new Date(dueDate).toDateString();

          rows = rows.filter(
            (task) => new Date(task.dueDate).toDateString() === selectedDate,
          );
        }

        const populatedRows = rows.map((task) => {
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
        });

        return {
          rows: populatedRows,
          total: populatedRows.length,
        };
      }

      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          search: search ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!workspaceId && user !== undefined,
  });

  return query;
};
