import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

interface useGetProjectsProps {
  workspaceId: string;
}

export const useGetProjects = ({ workspaceId }: useGetProjectsProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["projects", workspaceId, user?.isDemo],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const rows = demoData.projects.filter(
          (project) => project.workspaceId === workspaceId,
        );

        return {
          rows,
          total: rows.length,
        };
      }

      const response = await client.api.projects.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!workspaceId && user !== undefined,
  });

  return query;
};
