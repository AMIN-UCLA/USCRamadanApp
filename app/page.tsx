"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import DaySchedule from "@/components/DaySchedule";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { BASE_DATE } from "@/constants/baseDate";
import Footer from "@/components/Footer";

interface PrayerTime {
    [key: string]: string;
}

export default function Home() {
    const formatDateForInput = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().split("T")[0];
    };

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateInput, setDateInput] = useState(formatDateForInput(new Date()));
    const [isClient, setIsClient] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const fetchPrayerTimes = async () => {
            setLoading(true);
            setError(null);
            try {
                const base = new Date(selectedDate);
                const oneDay = 86400000; // milliseconds in one day
                const dates = [
                    new Date(base),
                    new Date(base.getTime() + oneDay),
                    new Date(base.getTime() + 2 * oneDay),
                ];

                const formatDateForAPI = (date: Date) => {
                    return `${String(date.getDate()).padStart(2, "0")}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}-${date.getFullYear()}`;
                };

                const promises = dates.map((date) =>
                    fetch(
                        `/api/prayer-times?date=${formatDateForAPI(date)}`
                    ).then((res) => {
                        if (!res.ok) {
                            throw new Error("Failed to fetch prayer times");
                        }
                        return res.json();
                    })
                );

                const results = await Promise.all(promises);
                setPrayerTimes(results);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrayerTimes();

        return () => window.removeEventListener("resize", checkMobile);
    }, [selectedDate]);

    // Replace the previous debounced effect with this:
    useEffect(() => {
        if (dateInput && !isNaN(Date.parse(dateInput))) {
            if (isMobile) {
                setSelectedDate(new Date(dateInput + "T00:00:00"));
            } else {
                const timer = setTimeout(() => {
                    setSelectedDate(new Date(dateInput + "T00:00:00"));
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [dateInput, isMobile]);

    const days = ["today", "tomorrow", "dayAfterTomorrow"];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {isClient &&
                    (isMobile ? (
                        <>
                            <Swiper
                                spaceBetween={20}
                                slidesPerView={1}
                                centeredSlides={true}
                                pagination={{
                                    clickable: true,
                                    el: ".swiper-pagination-bottom",
                                }}
                                modules={[Pagination]}
                                className="mb-4"
                            >
                                {days.map((day, index) => (
                                    <SwiperSlide key={index}>
                                        <DaySchedule
                                            day={
                                                day as
                                                    | "today"
                                                    | "tomorrow"
                                                    | "dayAfterTomorrow"
                                            }
                                            prayerTimes={prayerTimes[index]}
                                            baseDate={selectedDate}
                                            {...(day === "today" &&
                                            prayerTimes[1]
                                                ? {
                                                      nextDayPrayerTimes:
                                                          prayerTimes[1],
                                                  }
                                                : {})}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className="swiper-pagination-bottom flex justify-center"></div>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {days.map((day, index) => (
                                <DaySchedule
                                    key={index}
                                    day={
                                        day as
                                            | "today"
                                            | "tomorrow"
                                            | "dayAfterTomorrow"
                                    }
                                    prayerTimes={prayerTimes[index]}
                                    baseDate={selectedDate}
                                    {...(day === "today" && prayerTimes[1]
                                        ? { nextDayPrayerTimes: prayerTimes[1] }
                                        : {})}
                                />
                            ))}
                        </div>
                    ))}
                <div className="mt-8 flex flex-col items-center">
                    <p className="mb-2 text-sm text-gray-700">
                        Select date for preview:
                    </p>
                    <input
                        type="date"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="p-2 border rounded"
                        min="2025-02-28"
                        max="2025-03-30"
                    />
                    {/* Button to return to today if selectedDate is not current day */}
                    {formatDateForInput(selectedDate) !==
                        formatDateForInput(new Date()) && (
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => {
                                const today = new Date();
                                setDateInput(formatDateForInput(today));
                            }}
                        >
                            Today
                        </button>
                    )}
                </div>
                <Footer />
            </div>
        </main>
    );
}
