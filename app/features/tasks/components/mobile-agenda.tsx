"use client";

import {
  addDays,
  format,
  isAfter,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { MobileTaskList } from "./mobile-task-list";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MobileAgendaProps {
  data: Task[];
  selectedDay: Date;
  onSelectedDayChange: (day: Date | null) => void;
}

export const MobileAgenda = ({
  data,
  selectedDay,
  onSelectedDayChange,
}: MobileAgendaProps) => {
  const today = startOfDay(new Date());

  const dayTasks = data.filter((task) =>
    isSameDay(new Date(task.dueDate), selectedDay),
  );

  const upcomingTasks = data
    .filter((task) => {
      const dueDate = new Date(task.dueDate);

      return (
        isAfter(startOfDay(dueDate), today) && !isSameDay(dueDate, selectedDay)
      );
    })
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous day"
          onClick={() => onSelectedDayChange(subDays(selectedDay, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="min-w-0 text-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="max-w-full gap-1 px-2 font-semibold"
              >
                <CalendarDays className="size-4 shrink-0" />
                <span className="truncate">
                  {isSameDay(selectedDay, today)
                    ? "Today"
                    : format(selectedDay, "EEE, MMM d")}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="center" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={(date) => {
                  if (date) onSelectedDayChange(date);
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="outline"
          size="icon"
          aria-label="Next day"
          onClick={() => onSelectedDayChange(addDays(selectedDay, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Tasks due on this day</h3>

        {dayTasks.length > 0 ? (
          <MobileTaskList tasks={dayTasks} />
        ) : (
          <p className="rounded-md border p-5 text-center text-sm text-muted-foreground">
            No tasks due on this day.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Next deadlines</h3>

        {upcomingTasks.length > 0 ? (
          <MobileTaskList tasks={upcomingTasks} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No upcoming deadlines.
          </p>
        )}
      </section>
    </div>
  );
};
