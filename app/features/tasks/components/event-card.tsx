import { cn } from "@/lib/utils";
import { Project } from "../../projects/types";
import { Member } from "../../members/types";
import { TaskStatus } from "../types";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import Link from "next/link";

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

  if (!project?.name) {
    return null;
  }

  return (
    <Link
      href={`/workspaces/${workspaceId}/tasks/${id}`}
      onClick={(e) => e.stopPropagation()}
      title={title}
      className={cn(
        "flex h-5 w-full min-w-0 items-center overflow-hidden rounded-sm border-l-[3px] bg-card px-1.5 ml-1 text-xs text-foreground transition-colors hover:bg-accent/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        statusColorMap[status],
      )}
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
    </Link>
  );
};
