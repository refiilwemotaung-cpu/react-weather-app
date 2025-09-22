import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import DateTimeDisplay from "./components/DateTimeDisplay";
import CurrentWeather from "./components/CurrentWeather";
import Forecast from "./components/Forecast";
import UnitToggle from "./components/UnitToggle";
import ThemeToggle from "./components/ThemeToggle";
import SearchBar from "./components/SearchBar";

if (!process.env.REACT_APP_OPENWEATHER_API_KEY) {
  console.error("OpenWeatherMap API key is missing");
}

if (!process.env.REACT_APP_OPENWEATHER_BASE_URL) {
  console.error("OpenWeatherMap base URL is missing");
}

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

  // Add this useEffect to preload images

  useEffect(() => {
    // Preload all background images
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
  }, [timezoneOffset]); // Add timezoneOffset as dependency

  // Fetch weather data function with useCallback to avoid recreation on every render

  const fetchWeatherData = useCallback(async (city) => {
    try {
      setLoading(true);
      setError(null);

      const currentResponse = await fetch(
        `${process.env.REACT_APP_OPENWEATHER_BASE_URL}/weather?q=${city}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
      );

      if (!currentResponse.ok) {
        throw new Error("City not found");
      }

      const currentData = await currentResponse.json();

      // Set timezone offset from API response

      setTimezoneOffset(currentData.timezone);

      const forecastResponse = await fetch(
        `${process.env.REACT_APP_OPENWEATHER_BASE_URL}/forecast?q=${city}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
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
