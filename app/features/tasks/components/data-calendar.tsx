import { Task } from "../types";
import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalendarProps {
  data: Task[];
  selectedDate?: Date;
  onClearDate: () => void;
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight">
        {format(date, "MMMM yyyy")}
      </h2>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous month"
            onClick={() => onNavigate("PREV")}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            aria-label="Next month"
            onClick={() => onNavigate("NEXT")}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DataCalendar = ({
  data,
  selectedDate,
  onClearDate,
}: DataCalendarProps) => {
  const [value, setValue] = useState(() => new Date());

  const displayedDate = selectedDate ?? value;

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.$id,
  }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(displayedDate, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(displayedDate, 1));
    } else {
      setValue(new Date());
    }

    if (selectedDate) {
      onClearDate();
    }
  };

  return (
    <Calendar
      localizer={localizer}
      date={displayedDate}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      popup
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        event: ({ event }) => (
          <EventCard
            id={event.id}
            title={event.title}
            assignee={event.assignee}
            project={event.project}
            status={event.status}
          />
        ),
        toolbar: () => (
          <CustomToolbar date={displayedDate} onNavigate={handleNavigate} />
        ),
      }}
    />
  );
};
