import React from "react";

// Weather condition to icon mapping
const weatherIcons = {
  Clear: "fa-sun",
  Clouds: "fa-cloud",
  Rain: "fa-cloud-rain",
  Snow: "fa-snowflake",
  Thunderstorm: "fa-bolt",
  Drizzle: "fa-cloud-drizzle",
  Mist: "fa-smog",
  Smoke: "fa-smog",
  Haze: "fa-smog",
  Dust: "fa-smog",
  Fog: "fa-smog",
};

const ForecastDay = ({ day, convertTemp, getTempUnit }) => {
  return (
    <div className="forecast-card">
      <div className="centered-forecast">
        <div className="forecast-day">{day.day}</div>
        <div className="forecast-icon">
          <i className={`fas ${weatherIcons[day.weather]}`}></i>
        </div>
        <div className="forecast-temp">
          {convertTemp(day.temp)}
          {getTempUnit()}
        </div>
        <div className="forecast-condition">{day.weather}</div>
      </div>
    </div>
  );
};

export default ForecastDay;
