import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.members)[":memberId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[":memberId"]["$delete"]
>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      if (user?.isDemo) {
        if (param.memberId === "demo-member-1") {
          throw new Error("Demo user cannot be removed");
        }

        const demoData = getDemoData();

        const memberToDelete = demoData.members.find(
          (member) => member.$id === param.memberId,
        );

        if (!memberToDelete) {
          throw new Error("Demo member not found");
        }

        const workspaceMembers = demoData.members.filter(
          (member) => member.workspaceId === memberToDelete.workspaceId,
        );

        if (workspaceMembers.length <= 1) {
          throw new Error("You cannot remove the last member");
        }

        demoData.members = demoData.members.filter(
          (member) => member.$id !== param.memberId,
        );

        demoData.tasks = demoData.tasks.map((task) =>
          task.assigneeId === param.memberId
            ? { ...task, assigneeId: "demo-member-1" }
            : task,
        );

        setDemoData(demoData);

        return {
          data: {
            $id: param.memberId,
          },
        } as unknown as ResponseType;
      }

      const response = await client.api.members[":memberId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete member");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Member deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(error.message || "You can't remove this member");
    },
  });

  return mutation;
};
