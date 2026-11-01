import { MoreHorizontal } from "lucide-react";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { TaskActions } from "./task-actions";
import DottedSeparator from "@/components/dotted-separator";
import { MemberAvatar } from "../../members/components/members-avatar";
import { TaskDate } from "./task-date";
import { ProjectAvatar } from "../../projects/components/project-avatar";

interface KanbanCardProps {
  task: Task;
  quickStatusChange?: boolean;
}

export const KanbanCard = ({
  task,
  quickStatusChange = false,
}: KanbanCardProps) => {
  return (
    <div className="bg-background dark:bg-card p-2.5 mb-1.5 rounded shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-x-2">
        <p className="text-sm line-clamp-2">{task.name}</p>
        <TaskActions
          id={task.$id}
          projectId={task.projectId}
          quickStatus={quickStatusChange ? task.status : undefined}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border-none"
            aria-label={`Actions for ${task.name}`}
          >
            <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-700 dark:text-white hover:opacity-75 transition" />
          </Button>
        </TaskActions>
      </div>
      <DottedSeparator />
      <div className="flex items-center gap-x-1.5">
        <MemberAvatar
          name={task.assignee?.name ?? task.assigneeId}
          fallbackClassName="text-[10px]"
        />
        <div className="size-1 rounded-full bg-neutral-300" />
        <TaskDate
          value={new Date(task.dueDate).toISOString()}
          className="text-xs"
        />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.project?.name ?? task.projectId}
          image={task.project?.imageUrl ?? undefined}
          fallbackClassName="text-[10px]"
        />
        <span className="text-sm font-medium">
          {" "}
          {task.project?.name ?? "Project"}
        </span>
      </div>
    </div>
  );
};
