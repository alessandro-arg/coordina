"use client";

import DottedSeparator from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { Task, TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "../../projects/hooks/use-project-id";
import { MobileTaskList } from "./mobile-task-list";
import { MobileKanban } from "./mobile-kanban";
import { MobileAgenda } from "./mobile-agenda";
import { isSameDay } from "date-fns";

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilter,
}: TaskViewSwitcherProps) => {
  const [{ status, assigneeId, projectId, dueDate }, setFilters] =
    useTaskFilters();

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();

  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: paramProjectId || projectId,
    assigneeId,
    status,
    dueDate: view === "calendar" ? undefined : dueDate,
  });

  const taskRows = (tasks?.rows ?? []) as unknown as Task[];

  const onKanbanChange = useCallback(
    (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({ json: { tasks } });
    },
    [bulkUpdate],
  );

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger
              value="table"
              className="h-8 min-w-0 w-full lg:w-auto lg:min-w-20"
            >
              Table
            </TabsTrigger>
            <TabsTrigger
              value="kanban"
              className="h-8 min-w-0 w-full lg:w-auto lg:min-w-20"
            >
              Kanban
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="h-8 min-w-0 w-full lg:w-auto lg:min-w-20"
            >
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="w-full lg:w-auto" onClick={open}>
            <PlusIcon className="size-4" />
            New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />
        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-50 flex flex-col items-center justify-center">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <div className="lg:hidden">
                <MobileTaskList tasks={taskRows} />
              </div>

              <div className="hidden lg:block">
                <DataTable columns={columns} data={taskRows} />
              </div>
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
              <div className="lg:hidden">
                <MobileKanban data={taskRows} />
              </div>

              <div className="hidden lg:block">
                <DataKanban onChange={onKanbanChange} data={taskRows} />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <div className="lg:hidden">
                <MobileAgenda
                  data={taskRows}
                  selectedDay={dueDate ? new Date(dueDate) : new Date()}
                  onSelectedDayChange={(date) =>
                    setFilters({
                      dueDate: date ? date.toISOString() : null,
                    })
                  }
                />
              </div>

              <div className="hidden lg:block h-full">
                <DataCalendar
                  data={
                    dueDate
                      ? taskRows.filter((task) =>
                          isSameDay(new Date(task.dueDate), new Date(dueDate)),
                        )
                      : taskRows
                  }
                />
              </div>
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

export default TaskViewSwitcher;
