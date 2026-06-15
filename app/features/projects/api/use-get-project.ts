import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

interface useGetProjectProps {
  projectId: string;
}

export const useGetProject = ({ projectId }: useGetProjectProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["project", projectId, user?.isDemo],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const project = demoData.projects.find(
          (project) => project.$id === projectId,
        );

        if (!project) {
          throw new Error("Demo project not found");
        }

        return project;
      }

      const response = await client.api.projects[":projectId"].$get({
        param: { projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!projectId && user !== undefined,
  });

  return query;
};
