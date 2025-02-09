"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { EventDialog } from "./event-dialog";
import { CalendarHeader } from "./calendar-header";

interface Event {
  id: string;
  name: string;
  description: string;
  time: string;
  date: string;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch (error) {
        console.error("Error retreving localStorage: ", error);
      }
    }
    // console.log(storedEvents)
  }, []);

  console.log(events);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("events", JSON.stringify(events));
    }
    // console.log(events);
  }, [events]);

  const handleSelect = useCallback((date: Date | undefined) => {
    if (date && !isBefore(startOfDay(date), startOfDay(new Date()))) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  }, []);

  const addEvent = useCallback((event: Omit<Event, "id">) => {
    // console.log(event)
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      date: format(event.date, "yyyy-MM-dd"),
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setIsDialogOpen(false);
  }, []);

  const getEventsForDate = useCallback(
    (date: Date) => {
      return events.filter(
        (event) => event.date === format(date, "yyyy-MM-dd")
      );
    },
    [events]
  );

  const dayContent = useCallback(
    ({ date }: { date: Date }) => {
      const eventsForDate = getEventsForDate(date);
      return (
        <div className="w-full h-40 flex flex-col justify-start p-2 border rounded-lg hover:bg-accent/50 transition-colors">
          <span className="block text-lg font-semibold">
            {format(date, "d")}
          </span>
          <div className="mt-1 space-y-1">
            {eventsForDate.map((event) => (
              <div
                key={event.id}
                className="text-sm p-1 bg-primary/10 w-full rounded truncate"
              >
                {event.time} - {event.name}
              </div>
            ))}
          </div>
        </div>
      );
    },
    [getEventsForDate]
  );

  const modifiers = useMemo(
    () => ({
      hasEvents: (date: Date) => getEventsForDate(date).length > 0,
    }),
    [getEventsForDate]
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-7xl space-y-6">
        <CalendarHeader />
        <div className="flex w-full justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) =>
              isBefore(startOfDay(date), startOfDay(new Date()))
            }
            modifiers={modifiers}
            modifiersClassNames={{
              hasEvents: "has-events",
            }}
            components={{
              DayContent: dayContent,
            }}
            className="w-full rounded-lg grid grid-cols-7 gap-2 p-4"
          />
        </div>
        <EventDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedDate={selectedDate}
          //@ts-ignore
          onSubmit={addEvent}
          //@ts-ignore
          events={events}
        />
      </div>
    </div>
  );
}
