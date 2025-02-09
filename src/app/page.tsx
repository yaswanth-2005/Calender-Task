"use client";

import { useState, useEffect } from "react";
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
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const handleSelect = (date: Date | undefined) => {
    if (date && !isBefore(startOfDay(date), startOfDay(new Date()))) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      date: format(event.date, "yyyy-MM-dd"),
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    setIsDialogOpen(false);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date === format(date, "yyyy-MM-dd"));
  };

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
            modifiers={{
              hasEvents: (date) => getEventsForDate(date).length > 0,
            }}
            modifiersClassNames={{
              hasEvents: "has-events",
            }}
            components={{
              DayContent: ({ date }) => (
                <div className="w-full h-40 flex flex-col justify-start p-2 border rounded-lg hover:bg-accent/50 transition-colors">
                  <span className="block text-lg font-semibold">
                    {format(date, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {getEventsForDate(date).map((event) => (
                      <div
                        key={event.id}
                        className="text-sm p-1 bg-primary/10 w-full rounded truncate"
                      >
                        {event.time} - {event.name}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            }}
            className="w-full  rounded-lg grid grid-cols-7 gap-2 p-4"
          />
        </div>
        <EventDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedDate={selectedDate}
          //@ts-ignore
          onSubmit={addEvent}
        />
      </div>
    </div>
  );
}
