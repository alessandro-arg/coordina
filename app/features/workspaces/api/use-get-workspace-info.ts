import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

interface useGetWorkspaceInfoProps {
  workspaceId: string;
  inviteCode: string;
}

export const useGetWorkspaceInfo = ({
  workspaceId,
  inviteCode,
}: useGetWorkspaceInfoProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: [
      "workspace-info",
      workspaceId,
      inviteCode,
      user?.id,
      user?.isDemo,
    ],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const workspace = demoData.workspaces.find(
          (workspace) => workspace.$id === workspaceId,
        );

        if (!workspace) {
          throw new Error("Demo workspace not found");
        }

        if (workspace.inviteCode !== inviteCode) {
          throw new Error("Invalid invite code");
        }

        return {
          $id: workspace.$id,
          name: workspace.name,
          imageUrl: workspace.imageUrl,
          isMember: true,
        };
      }

      const response = await client.api.workspaces[":workspaceId"]["info"].$get(
        {
          param: { workspaceId },
          query: { inviteCode },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workspace info");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!workspaceId && !!inviteCode && user !== undefined,
  });

  return query;
};
