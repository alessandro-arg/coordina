import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { getDemoData, setDemoData } from "@/lib/demo-storage";

type ResponseType = InferResponseType<
  (typeof client.api.projects)[":projectId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)[":projectId"]["$patch"]
>;

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      if (user?.isDemo) {
        const demoData = getDemoData();

        const projectIndex = demoData.projects.findIndex(
          (project) => project.$id === param.projectId,
        );

        if (projectIndex === -1) {
          throw new Error("Demo project not found");
        }

        const currentProject = demoData.projects[projectIndex];

        const updatedProject = {
          ...currentProject,
          name:
            typeof form.name === "string" && form.name.length > 0
              ? form.name
              : currentProject.name,
          imageUrl:
            typeof form.image === "string" && form.image.length > 0
              ? form.image
              : (currentProject.imageUrl ?? null),
        };

        demoData.projects[projectIndex] = updatedProject;
        setDemoData(demoData);

        return {
          data: {
            _id: updatedProject.$id,
            ...updatedProject,
          },
        } as ResponseType;
      }

      const response = await client.api.projects[":projectId"]["$patch"]({
        form,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  return mutation;
};
