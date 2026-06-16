import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { createDemoId, getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.projects)["$post"],
  200
>;
type RequestType = InferRequestType<(typeof client.api.projects)["$post"]>;

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const project = {
          $id: createDemoId("demo-project"),
          name: String(form.name ?? "Untitled Project"),
          imageUrl:
            typeof form.image === "string" && form.image.length > 0
              ? form.image
              : null,
          workspaceId: String(form.workspaceId),
        };

        demoData.projects.push(project);
        setDemoData(demoData);

        return {
          data: project,
        } as ResponseType;
      }

      const response = await client.api.projects["$post"]({ form });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["project", data.$id],
      });
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  return mutation;
};
