import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "../../members/api/use-get-members";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { LoaderCircle } from "lucide-react";
import { useGetTask } from "../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";
import { Task } from "../types";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
    taskId: id,
  });

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });

  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const projectOptions =
    projects?.rows.map((project) => ({
      id: project.$id,
      name: project.name ?? "Project",
      imageUrl: project.imageUrl ?? undefined,
    })) ?? [];

  const memberOptions =
    members?.rows.map((member) => ({
      id: member.$id,
      name: member.name ?? "User",
    })) ?? [];

  const isLoading = isLoadingMembers || isLoadingProjects || isLoadingTask;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!initialValues) return null;

  const task = initialValues as unknown as Task;

  return (
    <div>
      <EditTaskForm
        onCancel={onCancel}
        initialValues={task}
        projectOptions={projectOptions}
        memberOptions={memberOptions}
      />
    </div>
  );
};
