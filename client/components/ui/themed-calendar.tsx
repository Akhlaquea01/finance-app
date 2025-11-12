"use client";

import React from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/styles/react-calendar-custom.css";

const ThemedCalendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (props, ref) => (
    <div ref={ref}>
      <Calendar {...props} />
    </div>
  )
);

ThemedCalendar.displayName = "ThemedCalendar";
export default ThemedCalendar;
