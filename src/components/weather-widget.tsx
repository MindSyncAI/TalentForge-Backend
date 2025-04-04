import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feelsLike?: number;
  cloudCover?: number;
  country?: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      // Force Bhubaneswar coordinates
      const response = await fetch(
        `https://api.weatherstack.com/current?access_key=${import.meta.env.VITE_WEATHER_API_KEY}&query=Bhubaneswar&units=m`
      );
      const data = await response.json();
      console.log('Weather API Response:', data);

      if (data.error) {
        console.error('Weather API Error:', data.error);
        throw new Error(data.error.info);
      }

      if (!data.location || !data.current) {
        console.error('Invalid weather data:', data);
        throw new Error('Invalid weather data received');
      }

      setWeather({
        location: 'Bhubaneswar',
        temperature: Math.round(data.current.temperature),
        condition: data.current.weather_descriptions[0],
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_speed),
        icon: data.current.weather_icons[0],
        feelsLike: Math.round(data.current.feelslike),
        cloudCover: data.current.cloudcover,
        country: 'IN'
      });
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Set default Bhubaneswar data
      setWeather({
        location: 'Bhubaneswar',
        temperature: 30,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 10,
        icon: '',
        feelsLike: 32,
        cloudCover: 40,
        country: 'IN'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (weather) {
      // Always fetch Bhubaneswar weather
      fetchWeather(20.2961, 85.8245);
    }
  };

  useEffect(() => {
    // Initial fetch for Bhubaneswar
    fetchWeather(20.2961, 85.8245);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-[#ccdcec]/60 dark:bg-[#111112]/40 backdrop-blur-xl rounded-3xl">
        <Loader2 className="h-6 w-6 animate-spin text-sky-600 dark:text-white" />
      </div>
    );
  }

  const WeatherIcon = ({ type }: { type: string }) => {
    return (
      <span className="text-white opacity-80">
        {type === 'sun' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V4M12 20V21M3 12H4M20 12H21M5.5 5.5L6.2 6.2M18.5 18.5L17.8 17.8M5.5 18.5L6.2 17.8M18.5 5.5L17.8 6.2M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        {type === 'rain' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14V16M10 14V16M14 14V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12C4 8.13401 7.13401 5 11 5C14.866 5 18 8.13401 18 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )}
        {type === 'wind' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H15C16.6569 8 18 6.65685 18 5C18 3.34315 16.6569 2 15 2M3 12H19C20.6569 12 22 13.3431 22 15C22 16.6569 20.6569 18 19 18M3 16H13C14.6569 16 16 17.3431 16 19C16 20.6569 14.6569 22 13 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        {type === 'cloud' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 19C4.01472 19 2 16.9853 2 14.5C2 12.0147 4.01472 10 6.5 10C6.5 6.13401 9.63401 3 13.5 3C17.366 3 20.5 6.13401 20.5 10C22.433 10 24 11.567 24 13.5C24 15.433 22.433 17 20.5 17H6.5Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className="p-6 bg-[#ccdcec]/60 dark:bg-[#111112]/40 backdrop-blur-xl rounded-3xl text-black dark:text-white border border-[#ccdcec] dark:border-[#1D1D1F]">
      <h2 className="text-lg font-medium mb-4">Weather</h2>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-medium">{weather?.location}</div>
            <div className="text-xs text-black/60 dark:text-gray-400">{weather?.country}</div>
          </div>
          <div className="text-2xl font-medium">{weather?.temperature}°C</div>
        </div>
        <hr className="border-[#ccdcec] dark:border-[#1D1D1F]" />
        <div className="grid grid-cols-2 gap-y-6">
          <div className="flex items-center gap-2">
            <WeatherIcon type="sun" />
            <div>
              <div className="text-xs text-black/60 dark:text-gray-400">Feels like</div>
              <div className="text-sm">{weather?.feelsLike}°C</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon type="rain" />
            <div>
              <div className="text-xs text-black/60 dark:text-gray-400">Humidity</div>
              <div className="text-sm">{weather?.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon type="wind" />
            <div>
              <div className="text-xs text-black/60 dark:text-gray-400">Wind</div>
              <div className="text-sm">{weather?.windSpeed} km/h</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon type="cloud" />
            <div>
              <div className="text-xs text-black/60 dark:text-gray-400">Cloud Cover</div>
              <div className="text-sm">{weather?.cloudCover}%</div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="w-full text-center text-xs text-black/60 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
