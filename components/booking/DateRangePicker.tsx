"use client";

import React, { useState, useEffect, useRef } from "react";

interface DateRangePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (checkIn: Date | null, checkOut: Date | null) => void;
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleMonthPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleMonthNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleDateClick = (date: Date) => {
    if (date < today) return; // Prevent picking past dates

    if (!checkIn || (checkIn && checkOut)) {
      // First select or starting over
      onChange(date, null);
    } else if (checkIn && !checkOut) {
      if (date <= checkIn) {
        // If user clicks a date before or equal to check-in, treat it as new check-in
        onChange(date, null);
      } else {
        // Set check-out
        onChange(checkIn, date);
        setIsOpen(false); // Auto close after full selection
      }
    }
  };

  const isSelected = (date: Date) => {
    if (checkIn && date.getTime() === checkIn.getTime()) return "start";
    if (checkOut && date.getTime() === checkOut.getTime()) return "end";
    return null;
  };

  const isInRange = (date: Date) => {
    if (checkIn && checkOut) {
      return date > checkIn && date < checkOut;
    }
    if (checkIn && !checkOut && hoverDate) {
      return date > checkIn && date <= hoverDate;
    }
    return false;
  };

  const formatDateString = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  
  const calendarCells = [];
  
  // Previous month padding
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, day);
    calendarCells.push({ date, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarCells.push({ date, isCurrentMonth: true });
  }

  // Next month padding to complete 6 rows (42 cells)
  const remainingCells = 42 - calendarCells.length;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(nextYear, nextMonth, day);
    calendarCells.push({ date, isCurrentMonth: false });
  }

  // Calculate nights and days
  let nightsCount = 0;
  let daysCount = 0;
  if (checkIn && checkOut) {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    nightsCount = Math.round(diffTime / (1000 * 60 * 60 * 24));
    daysCount = nightsCount + 1;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Date Inputs Selector View */}
      <div className="grid grid-cols-2 gap-2.5">
        <div 
          onClick={() => setIsOpen(true)}
          className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${
            isOpen ? "border-blue-500 bg-blue-50/10 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Check-in
          </span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
            <span>{formatDateString(checkIn)}</span>
          </div>
        </div>

        <div 
          onClick={() => setIsOpen(true)}
          className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${
            isOpen ? "border-blue-500 bg-blue-50/10 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Check-out
          </span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
            <span>{formatDateString(checkOut)}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Duration Info Badge */}
      {checkIn && checkOut && (
        <div className="mt-3 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-600">bedtime</span>
            <span>{nightsCount} {nightsCount === 1 ? "Night" : "Nights"} Stay</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-600">wb_sunny</span>
            <span>{daysCount} {daysCount === 1 ? "Day" : "Days"} Total</span>
          </span>
        </div>
      )}

      {/* Calendar Dropdown Card */}
      {isOpen && (
        <div className="absolute top-[102%] left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 animate-fade-in w-full min-w-[280px]">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={handleMonthPrev}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <span className="text-sm font-bold text-slate-800">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleMonthNext}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[11px] font-bold text-slate-400">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map(({ date, isCurrentMonth }, index) => {
              const dateType = isSelected(date);
              const isToday = date.getTime() === today.getTime();
              const isPast = date < today;
              const inRange = isInRange(date);
              
              let cellClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all relative cursor-pointer ";
              
              if (isPast) {
                cellClass += "text-slate-300 cursor-not-allowed ";
              } else if (!isCurrentMonth) {
                cellClass += "text-slate-400 hover:bg-slate-100 ";
              } else {
                cellClass += "text-slate-700 hover:bg-slate-100 ";
              }

              // Highlight range
              if (inRange && !isPast) {
                cellClass += "bg-blue-50 text-blue-700 rounded-none ";
              }

              // Highlight start/end selection
              if (dateType === "start") {
                cellClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white shadow-md z-10 scale-105 ";
              } else if (dateType === "end") {
                cellClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white shadow-md z-10 scale-105 ";
              }

              // Underline today
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-center py-0.5 relative"
                  onMouseEnter={() => !isPast && setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  onClick={() => handleDateClick(date)}
                >
                  <span className={cellClass}>
                    {date.getDate()}
                    {isToday && dateType === null && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600"></span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Selection Instructions */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
            <span>
              {!checkIn ? "Choose check-in date" : !checkOut ? "Choose check-out date" : "Select different dates"}
            </span>
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="text-red-500 hover:text-red-700 transition-colors font-bold uppercase cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
