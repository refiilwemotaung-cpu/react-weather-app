import React from "react";
import ForecastDay from "./ForecastDay";

const Forecast = ({ forecast, convertTemp, getTempUnit }) => {
  if (!forecast) return null;

  return (
    <>
      <h4 className="my-4 text-center">5-Day Forecast</h4>
      <div className="forecast-container">
        <div className="forecast-row">
          {forecast.map((day, index) => (
            <ForecastDay
              key={index}
              day={day}
              convertTemp={convertTemp}
              getTempUnit={getTempUnit}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Forecast;
