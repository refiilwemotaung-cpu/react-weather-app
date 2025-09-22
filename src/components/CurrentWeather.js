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

const CurrentWeather = ({ weatherData, convertTemp, getTempUnit }) => {
  if (!weatherData) return null;

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="weather-card centered-layout">
          <div className="city-name">{weatherData.city}</div>
          <div className="weather-main">
            <div className="current-temp">
              {convertTemp(weatherData.current.temp)}
              {getTempUnit()}
            </div>
            <div className="weather-icon-large">
              <i
                className={`fas ${weatherIcons[weatherData.current.weather]}`}
              ></i>
            </div>
            <div className="weather-condition">
              {weatherData.current.weather}
            </div>
          </div>
          <div className="weather-details-grid">
            <div className="detail-item">
              <div className="detail-label">Feels like</div>
              <div className="detail-value">
                {convertTemp(weatherData.current.feels_like)}
                {getTempUnit()}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Humidity</div>
              <div className="detail-value">
                {weatherData.current.humidity}%
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Wind</div>
              <div className="detail-value">{weatherData.current.wind} m/s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
