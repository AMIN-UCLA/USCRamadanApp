"use client";

import { useState, useEffect } from "react";
import PrayerTimes from "./PrayerTimes";
import EventList from "./EventList";
import { BASE_DATE } from "@/constants/baseDate";

interface DayScheduleProps {
    day: "today" | "tomorrow" | "dayAfterTomorrow";
    prayerTimes: { [key: string]: string } | undefined;
    // optional baseDate prop to override the default BASE_DATE
    baseDate?: Date;
    // new optional prop for next day's prayer times (for suhoor countdown)
    nextDayPrayerTimes?: { [key: string]: string };
}

export default function DaySchedule({
    day,
    prayerTimes,
    baseDate,
    nextDayPrayerTimes,
}: DayScheduleProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [suhoorTimeLeft, setSuhoorTimeLeft] = useState<number>(0);

    useEffect(() => {
        const base = baseDate ? new Date(baseDate) : new Date(BASE_DATE);
        if (day === "tomorrow") {
            base.setDate(base.getDate() + 1);
        } else if (day === "dayAfterTomorrow") {
            base.setDate(base.getDate() + 2);
        }
        setDate(base);
    }, [day, baseDate]);

    // Compute normalized dates and Hijri date
    const normalizedCurrent = new Date();
    normalizedCurrent.setHours(0, 0, 0, 0);
    const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
    const isToday = normalizedDate.getTime() === normalizedCurrent.getTime();
    const hijriDate = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);

    // Determine prefix for header based on day prop
    let prefix = "";
    const normalizedTomorrow = new Date(normalizedCurrent);
    normalizedTomorrow.setDate(normalizedTomorrow.getDate() + 1);
    if (day === "today" && isToday) {
        prefix = "Today, ";
    } else if (
        day === "tomorrow" &&
        normalizedDate.getTime() === normalizedTomorrow.getTime()
    ) {
        prefix = "Tomorrow, ";
    }

    useEffect(() => {
        if (
            isToday &&
            prayerTimes &&
            prayerTimes["maghrib"] &&
            prayerTimes["fajr"]
        ) {
            const targetTimeStr = prayerTimes["maghrib"];
            const [targetHour, targetMinute] = targetTimeStr
                .split(":")
                .map(Number);
            const targetTime = new Date(date);
            targetTime.setHours(targetHour, targetMinute, 0, 0);

            // Compute today's fajr time
            const fajrTimeStr = prayerTimes["fajr"];
            const [fajrHour, fajrMinute] = fajrTimeStr.split(":").map(Number);
            const todayFajr = new Date(date);
            todayFajr.setHours(fajrHour, fajrMinute, 0, 0);

            function updateCountdown() {
                const now = new Date();
                if (now > todayFajr && now < targetTime) {
                    const diff = targetTime.getTime() - now.getTime();
                    setTimeLeft(diff);
                } else {
                    setTimeLeft(0);
                }
            }
            updateCountdown();
            const intervalId = setInterval(updateCountdown, 1000);
            return () => clearInterval(intervalId);
        }
    }, [isToday, prayerTimes, date]);

    // Updated suhoor countdown to use isha instead of maghrib
    useEffect(() => {
        if (
            isToday &&
            prayerTimes &&
            prayerTimes["isha"] &&
            nextDayPrayerTimes &&
            nextDayPrayerTimes["fajr"]
        ) {
            // Compute today's isha target time instead of maghrib
            const [ishaHour, ishaMinute] = prayerTimes["isha"]
                .split(":")
                .map(Number);
            const ishaTime = new Date(date);
            ishaTime.setHours(ishaHour, ishaMinute, 0, 0);

            // Compute tomorrow's fajr target time
            const tomorrow = new Date(date);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [fajrHour, fajrMinute] = nextDayPrayerTimes["fajr"]
                .split(":")
                .map(Number);
            const fajrTime = new Date(tomorrow);
            fajrTime.setHours(fajrHour, fajrMinute, 0, 0);

            function updateSuhoorCountdown() {
                const now = new Date();
                // show suhoor countdown only if current time is after isha and before fajr
                if (now > ishaTime && now < fajrTime) {
                    const diff = fajrTime.getTime() - now.getTime();
                    setSuhoorTimeLeft(diff);
                } else {
                    setSuhoorTimeLeft(0);
                }
            }
            updateSuhoorCountdown();
            const intervalId = setInterval(updateSuhoorCountdown, 1000);
            return () => clearInterval(intervalId);
        }
    }, [isToday, prayerTimes, nextDayPrayerTimes, date]);

    return (
        // Updated container with more pronounced rounded corners using rounded-xl
        <div
            className={`rounded-xl p-4 md:p-6 h-full ${
                isToday
                    ? "border-2 border-blue-500 shadow-lg bg-white"
                    : "bg-white shadow-md"
            }`}
        >
            <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-1">
                {prefix +
                    normalizedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
            </h2>
            <p className="text-xs text-gray-500">
                {normalizedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                })}
                {", "}
                {hijriDate}
            </p>
            {/* Updated Countdown for Maghrib: only shows between Fajr and Maghrib */}
            {isToday && timeLeft > 0 && (
                <p className="text-xs text-blue-500 mt-2">
                    Time until Maghrib:{" "}
                    {timeLeft < 60000
                        ? `${Math.floor(timeLeft / 1000)}s`
                        : `${Math.floor(timeLeft / 3600000)}h ${Math.floor(
                              (timeLeft % 3600000) / 60000
                          )}m`}
                </p>
            )}
            {/* Countdown for Suhoor */}
            {isToday && suhoorTimeLeft > 0 && (
                <p className="text-xs text-purple-500 mt-2">
                    Time until Fajr:{" "}
                    {suhoorTimeLeft < 60000
                        ? `${Math.floor(suhoorTimeLeft / 1000)}s`
                        : `${Math.floor(
                              suhoorTimeLeft / 3600000
                          )}h ${Math.floor(
                              (suhoorTimeLeft % 3600000) / 60000
                          )}m`}
                </p>
            )}
            <p className="text-xs text-gray-500 mb-2 border-b pb-2 md:mb-2"></p>
            {prayerTimes ? (
                <PrayerTimes prayerTimes={prayerTimes} />
            ) : (
                <div className="text-center text-gray-500">
                    Prayer times not available
                </div>
            )}
            <EventList date={date} />
        </div>
    );
}
