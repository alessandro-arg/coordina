import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData } from "@/lib/demo-storage";

export const useGetWorkspaces = () => {
  const { data: user } = useCurrent();

  const query = useQuery({
    queryKey: ["workspaces", user?.isDemo],

    queryFn: async () => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        return {
          rows: demoData.workspaces,
          total: demoData.workspaces.length,
        };
      }

      const response = await client.api.workspaces.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }

      const { data } = await response.json();

      return data;
    },

    enabled: user !== undefined,
  });

  return query;
};
