import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useDeleteTask } from "../api/use-delete-task";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUpdateTask } from "../api/use-update-task";
import { TaskStatus } from "../types";
import { snakeCaseToTitleCase } from "@/lib/utils";

const statusOrder = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

interface TaskActionsProps {
  id: string;
  projectId: string;
  children: React.ReactNode;
  quickStatus?: TaskStatus;
}

export const TaskActions = ({
  id,
  projectId,
  children,
  quickStatus,
}: TaskActionsProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { open } = useEditTaskModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task",
    "This action cannot be undone.",
    "destructive",
  );
  const { mutate, isPending } = useDeleteTask();

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    mutate({ param: { taskId: id } });
  };

  const onOpenTask = () => {
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  const onOpenProject = () => {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTask();

  const statusIndex = quickStatus ? statusOrder.indexOf(quickStatus) : -1;

  const previousStatus =
    statusIndex > 0 ? statusOrder[statusIndex - 1] : undefined;

  const nextStatus =
    statusIndex >= 0 ? statusOrder[statusIndex + 1] : undefined;

  const moveToStatus = (status: TaskStatus) => {
    updateStatus({
      param: { taskId: id },
      json: { status },
    });
  };

  return (
    <div className="flex justify-end">
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onOpenTask} className="font-medium p-2.5">
            <ExternalLinkIcon className="size-4 mr-1 stroke-2" />
            Task details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onOpenProject}
            className="font-medium p-2.5"
          >
            <ExternalLinkIcon className="size-4 mr-1 stroke-2" />
            Open project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => open(id)}
            disabled={false}
            className="font-medium p-2.5"
          >
            <PencilIcon className="size-4 mr-1 stroke-2" />
            Edit task
          </DropdownMenuItem>

          {quickStatus && (
            <>
              <DropdownMenuSeparator />

              {previousStatus && (
                <DropdownMenuItem
                  disabled={isUpdatingStatus}
                  onClick={() => moveToStatus(previousStatus)}
                >
                  <ChevronLeft className="size-4" />
                  Move to {snakeCaseToTitleCase(previousStatus)}
                </DropdownMenuItem>
              )}

              {nextStatus && (
                <DropdownMenuItem
                  disabled={isUpdatingStatus}
                  onClick={() => moveToStatus(nextStatus)}
                >
                  <ChevronRight className="size-4" />
                  Move to {snakeCaseToTitleCase(nextStatus)}
                </DropdownMenuItem>
              )}
            </>
          )}

          <DropdownMenuItem
            onClick={onDelete}
            disabled={isPending}
            className="text-amber-700 focus:text-amber-700 dark:text-red-400 dark:focus:text-red-400 font-medium p-2.5"
          >
            <TrashIcon className="text-amber-700 focus:text-amber-700 dark:text-red-400 dark:focus:text-red-400 size-4 mr-1 stroke-2" />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
