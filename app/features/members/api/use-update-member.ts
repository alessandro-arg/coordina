import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.members)[":memberId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[":memberId"]["$patch"]
>;

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const memberIndex = demoData.members.findIndex(
          (member) => member.$id === param.memberId,
        );

        if (memberIndex === -1) {
          throw new Error("Demo member not found");
        }

        if (param.memberId === "demo-member-1") {
          throw new Error("Demo user cannot be changed");
        }

        demoData.members[memberIndex] = {
          ...demoData.members[memberIndex],
          role: json.role,
        };

        setDemoData(demoData);

        return {
          data: {
            $id: param.memberId,
          },
        } as ResponseType;
      }

      const response = await client.api.members[":memberId"]["$patch"]({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to update member");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      toast.error("Failed to update member");
    },
  });

  return mutation;
};
