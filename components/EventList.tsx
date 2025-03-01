"use client";

import { useState, useEffect } from "react";
import scheduleData from "@/data/schedule.json";

interface EventListProps {
    date: Date;
}

interface Event {
    type: "taraweeh" | "iftaar" | "Jumaa" | "other";
    time: string;
    location: string;
    details?: string;
    name?: string;
    organization?: string;
    link?: string;
}

export default function EventList({ date }: EventListProps) {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        const dateString = date.toISOString().split("T")[0];
        const dayEvents =
            (scheduleData as Record<string, Event[]>)[dateString] || [];

        setEvents(dayEvents);
    }, [date]);

    return (
        <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Events</h3>
            {events.length === 0 ? (
                <p className="text-sm md:text-base">
                    No events scheduled for this day.
                </p>
            ) : (
                <ul className="space-y-2 md:space-y-4">
                    {events.map((event, index) => (
                        <li
                            key={index}
                            className="border-b pb-2 text-sm md:text-base"
                        >
                            <div className="font-semibold">
                                {event.type === "other"
                                    ? typeof event.name === undefined
                                        ? "Other Event"
                                        : event.name
                                    : event.type.charAt(0).toUpperCase() +
                                      event.type.slice(1)}
                            </div>
                            {event.type !== "iftaar" && (
                                <div>
                                    <span className="inline-block w-20">
                                        Time:
                                    </span>{" "}
                                    {event.time}
                                </div>
                            )}
                            <div>
                                <span className="inline-block w-20">
                                    Location:
                                </span>{" "}
                                {event.location}
                            </div>
                            {event.details && (
                                <div>
                                    <span className="inline-block w-20">
                                        Details:
                                    </span>{" "}
                                    {event.details}
                                </div>
                            )}
                            {event.link && (
                                <div>
                                    <span className="inline-block w-20">
                                        Register Here:
                                    </span>{" "}
                                    <a href={event.link} className="text-xs text-blue-500 mt-2"> link </a>
                                </div>
                            )}
                            {event.type === "other" && (
                                <div>
                                    <span className="inline-block w-20">
                                        Org:
                                    </span>{" "}
                                    {event.organization}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
