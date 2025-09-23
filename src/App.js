import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import DateTimeDisplay from "./components/DateTimeDisplay";
import CurrentWeather from "./components/CurrentWeather";
import Forecast from "./components/Forecast";
import UnitToggle from "./components/UnitToggle";
import ThemeToggle from "./components/ThemeToggle";
import SearchBar from "./components/SearchBar";

const API_KEY =
  process.env.REACT_APP_WEATHER_API_KEY ||
  process.env.REACT_APP_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

if (!API_KEY) {
  console.error(
    "Weather API key is missing. Please check your environment variables."
  );
}

console.log("API Key available:", !!API_KEY); // Debug line

const weatherBackgrounds = {
  Clear: "/images/weather-backgrounds/clear-sky.jpg",
  Clouds: "/images/weather-backgrounds/cloudy.jpg",
  Rain: "/images/weather-backgrounds/rainy-day.jpg",
  Snow: "/images/weather-backgrounds/snow.jpg",
  Thunderstorm: "/images/weather-backgrounds/thunderstorm.jpg",
  Drizzle: "/images/weather-backgrounds/drizzle.jpg",
  Mist: "/images/weather-backgrounds/mist.jpg",
  Smoke: "/images/weather-backgrounds/smoke.jpg",
  Haze: "/images/weather-backgrounds/haze.jpg",
  Dust: "/images/weather-backgrounds/dust.jpg",
  Fog: "/images/weather-backgrounds/fog.jpg",
};

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(
    weatherBackgrounds.Clear
  );
  const [timezoneOffset, setTimezoneOffset] = useState(0);

  // ADD THIS DEBUG EFFECT
  useEffect(() => {
    console.log("Current background image:", backgroundImage);
    console.log("Full URL:", window.location.origin + backgroundImage);

    // Test if image loads
    const testImage = (url) => {
      const img = new Image();
      img.onload = () => console.log("✅ Image loaded:", url);
      img.onerror = () => console.log("❌ Image failed:", url);
      img.src = url;
    };

    testImage(window.location.origin + backgroundImage);
  }, [backgroundImage]);

  // Add this useEffect to preload images
  useEffect(() => {
    Object.values(weatherBackgrounds).forEach((imageUrl) => {
      const img = new Image();
      img.src = imageUrl;
    });
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const utcNow = Date.now();
      const cityTime = new Date(utcNow + timezoneOffset * 1000);
      setCurrentTime(cityTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [timezoneOffset]);

  // FIX 3: Updated fetchWeatherData function with proper error handling
  const fetchWeatherData = useCallback(async (city) => {
    try {
      setLoading(true);
      setError(null);

      // FIX 4: Use the correct API_KEY and BASE_URL variables
      if (!API_KEY) {
        throw new Error("API key not configured");
      }

      const currentResponse = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      // FIX 5: Better error handling for failed responses
      if (!currentResponse.ok) {
        const errorText = await currentResponse.text();
        console.error("API Error Response:", errorText);

        if (currentResponse.status === 401) {
          throw new Error(
            "Invalid API key. Please check your environment variables."
          );
        } else if (currentResponse.status === 404) {
          throw new Error("City not found");
        } else {
          throw new Error(`API error: ${currentResponse.status}`);
        }
      }

      const currentData = await currentResponse.json();

      // Set timezone offset from API response
      setTimezoneOffset(currentData.timezone);

      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error("Forecast data unavailable");
      }

      const forecastData = await forecastResponse.json();
      const dailyForecast = processForecastData(forecastData.list);

      // Update background based on weather condition
      const weatherCondition = currentData.weather[0].main;
      setBackgroundImage(
        weatherBackgrounds[weatherCondition] || weatherBackgrounds.Clear
      );

      setWeatherData({
        city: currentData.name,
        current: {
          temp: Math.round(currentData.main.temp),
          weather: weatherCondition,
          humidity: currentData.main.humidity,
          wind: currentData.wind.speed,
          feels_like: Math.round(currentData.main.feels_like),
        },
        forecast: dailyForecast,
      });

      setLoading(false);
    } catch (err) {
      console.error("Fetch error details:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Update your time effect to use the timezone offset
  useEffect(() => {
    const timer = setInterval(() => {
      const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const cityTime = new Date(utc + 1000 * timezoneOffset);
      setCurrentTime(cityTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [timezoneOffset]);

  // Fetch weather data on component mount
  useEffect(() => {
    fetchWeatherData("Johannesburg");
  }, [fetchWeatherData]);

  const processForecastData = (forecastList) => {
    const dailyData = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = days[date.getDay()];

      if (!dailyData[day] || date.getHours() === 12) {
        dailyData[day] = {
          day: day,
          temp: Math.round(item.main.temp),
          weather: item.weather[0].main,
        };
      }
    });

    const today = days[new Date().getDay()];
    const dayArray = Object.values(dailyData);
    const todayIndex = dayArray.findIndex((item) => item.day === today);
    return dayArray.slice(todayIndex + 1, todayIndex + 6);
  };

  const convertTemp = (temp) => {
    if (isCelsius) return temp;
    return Math.round((temp * 9) / 5 + 32);
  };

  const getTempUnit = () => {
    return isCelsius ? "°C" : "°F";
  };

  const toggleTempUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherData(searchCity);
      setSearchCity("");
    }
  };

  const getBackgroundStyle = () => {
    return {
      backgroundImage: `url(${backgroundImage})`,
    };
  };

  return (
    <div
      className={`app-container ${darkMode ? "dark-mode" : ""}`}
      style={getBackgroundStyle()}
    >
      <div className="container">
        <div className="controls">
          <UnitToggle isCelsius={isCelsius} toggleTempUnit={toggleTempUnit} />
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>

        <SearchBar
          searchCity={searchCity}
          setSearchCity={setSearchCity}
          handleSearch={handleSearch}
        />

        <DateTimeDisplay currentTime={currentTime} />

        {loading && <div className="text-center">Loading weather data...</div>}

        {error && (
          <div className="alert alert-danger" role="alert">
            Error: {error}
          </div>
        )}

        {weatherData && !loading && (
          <>
            <CurrentWeather
              weatherData={weatherData}
              convertTemp={convertTemp}
              getTempUnit={getTempUnit}
            />

            <Forecast
              forecast={weatherData.forecast}
              convertTemp={convertTemp}
              getTempUnit={getTempUnit}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
