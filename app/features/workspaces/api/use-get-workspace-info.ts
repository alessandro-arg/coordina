import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

interface useGetWorkspaceInfoProps {
  workspaceId: string;
}

export const useGetWorkspaceInfo = ({
  workspaceId,
}: useGetWorkspaceInfoProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["workspace-info", workspaceId, user?.isDemo],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const workspace = demoData.workspaces.find(
          (workspace) => workspace.$id === workspaceId,
        );

        if (!workspace) {
          throw new Error("Demo workspace not found");
        }

        return {
          $id: workspace.$id,
          name: workspace.name,
          imageUrl: workspace.imageUrl,
        };
      }

      const response = await client.api.workspaces[":workspaceId"]["info"].$get(
        {
          param: { workspaceId },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workspace info");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!workspaceId && user !== undefined,
  });

  return query;
};
