"use client";

import { useState } from "react";
import { format, isBefore } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Event {
  id: string;
  name: string;
  description: string;
  time: string;
  date: string;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  onSubmit: (event: {
    name: string;
    description: string;
    time: string;
    date: Date;
  }) => void;
  events: Event[];
}

export function EventDialog({
  open,
  onOpenChange,
  selectedDate,
  onSubmit,
  events,
}: EventDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !name || !time) {
      setError("Please fill out all required fields.");
      return;
    }

    const currentTime = new Date();
    const eventTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${time}`);

    if (isBefore(eventTime, currentTime)) {
      setError("You cannot create an event in the past!");
      return;
    }

    const isEventConflict = events.some((event) => {
      const existingEventTime = new Date(`${event.date}T${event.time}`);
      return eventTime.getTime() === existingEventTime.getTime();
    });

    if (isEventConflict) {
      setError("An event already exists at this date and time.");
      return;
    }

    onSubmit({ name, description, time, date: selectedDate });
    setName("");
    setDescription("");
    setTime("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add Event for{" "}
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit">Save Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
