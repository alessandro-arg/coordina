import { Task, TaskStatus } from "../types";
import { KanbanCard } from "./kanban-card";
import { KanbanColumnHeader } from "./kanban-column-header";

const boards = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

interface MobileKanbanProps {
  data: Task[];
}

export const MobileKanban = ({ data }: MobileKanbanProps) => {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {boards.map((board) => {
        const tasks = data
          .filter((task) => task.status === board)
          .sort((a, b) => a.position - b.position);

        return (
          <section key={board} className="min-w-0 rounded-md bg-muted p-2">
            <KanbanColumnHeader board={board} taskCount={tasks.length} />

            {tasks.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                No tasks
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tasks.map((task) => (
                  <div key={task.$id} className="w-[90%] max-w-64 shrink-0">
                    <KanbanCard task={task} quickStatusChange />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
