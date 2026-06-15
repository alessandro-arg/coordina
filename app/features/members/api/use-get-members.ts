import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

interface useGetMembersProps {
  workspaceId: string;
}

export const useGetMembers = ({ workspaceId }: useGetMembersProps) => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["members", workspaceId, user?.isDemo],
    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const rows = demoData.members.filter(
          (member) => member.workspaceId === workspaceId,
        );

        return {
          rows,
          total: rows.length,
        };
      }

      const response = await client.api.members.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!workspaceId && user !== undefined,
  });

  return query;
};
