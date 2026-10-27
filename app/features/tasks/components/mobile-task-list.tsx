import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { MemberAvatar } from "../../members/components/members-avatar";
import { ProjectAvatar } from "../../projects/components/project-avatar";
import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";

interface MobileTaskListProps {
  tasks: Task[];
}

export const MobileTaskList = ({ tasks }: MobileTaskListProps) => {
  if (tasks.length === 0) {
    return (
      <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No results.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <article
          key={task.$id}
          className="min-w-0 space-y-3 rounded-md border bg-card p-3"
        >
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 break-words text-sm font-medium">
              {task.name}
            </p>
            <TaskActions id={task.$id} projectId={task.projectId}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label={`Actions for ${task.name}`}
              >
                <MoreVertical className="size-5" />
              </Button>
            </TaskActions>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
            <TaskDate
              value={new Date(task.dueDate).toISOString()}
              className="text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-2">
              <ProjectAvatar
                name={task.project?.name ?? "Project"}
                image={task.project?.imageUrl ?? undefined}
                className="size-5"
              />
              <span className="max-w-36 truncate">
                {task.project?.name ?? "Project"}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <MemberAvatar
                name={task.assignee?.name ?? "User"}
                className="size-5"
              />
              <span className="max-w-36 truncate">
                {task.assignee?.name ?? "User"}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
