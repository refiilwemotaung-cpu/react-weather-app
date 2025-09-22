import React from "react";

const DateTimeDisplay = ({ currentTime }) => {
  const formatDateTime = (date) => {
    return {
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),

      weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  };

  const formatted = formatDateTime(currentTime);

  return (
    <div className="datetime card-style">
      <div className="card-time">{formatted.time}</div>
      <div className="card-date">
        <div className="card-weekday">{formatted.weekday}</div>
        <div className="card-full-date">{formatted.date}</div>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
