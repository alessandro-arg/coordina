import { cn } from "@/lib/utils";
import { Project } from "../../projects/types";
import { Member } from "../../members/types";
import { TaskStatus } from "../types";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface EventCardProps {
  title: string;
  assignee: Partial<Member> | undefined;
  project: Partial<Project> | undefined;
  status: TaskStatus;
  id: string;
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-pink-500",
  [TaskStatus.TODO]: "border-l-red-500",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-500",
  [TaskStatus.IN_REVIEW]: "border-l-blue-500",
  [TaskStatus.DONE]: "border-l-emerald-500",
};

export const EventCard = ({ title, project, status, id }: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  if (!project?.name) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-5 w-full min-w-0 cursor-pointer items-center overflow-hidden rounded-sm border-l-[3px] bg-card px-1.5 ml-1 text-xs text-foreground transition-colors hover:bg-accent/70",
        statusColorMap[status],
      )}
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
    </div>
  );
};
