import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Loader2, MapPin } from 'lucide-react';

interface WeatherData {
    temp: number;
    condition: number;
}

export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchWeather() {
            try {
                // Fetch weather for London
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current_weather=true');
                const data = await res.json();
                setWeather({
                    temp: data.current_weather.temperature,
                    condition: data.current_weather.weathercode
                });
            } catch (e) {
                console.error("Failed to fetch weather", e);
                setError(true);
            }
        }

        fetchWeather();
        const interval = setInterval(fetchWeather, 600000); // 10 minutes
        return () => clearInterval(interval);
    }, []);

    const getWeatherIcon = (code: number) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code === 0) return <Sun className="w-5 h-5 text-yellow-400" />;
        if (code >= 1 && code <= 3) return <Cloud className="w-5 h-5 text-slate-300" />;
        if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
        if (code >= 71 && code <= 82) return <CloudSnow className="w-5 h-5 text-indigo-200" />;
        if (code >= 95) return <CloudLightning className="w-5 h-5 text-yellow-500" />;
        return <Cloud className="w-5 h-5 text-slate-400" />;
    };

    if (error) return null;

    return (
        <div className="flex items-center gap-2 bg-deep-sea-700/50 border border-deep-sea-600 rounded-lg px-3 py-1.5 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-300 mr-2">LONDON</span>
            {weather ? (
                <>
                    {getWeatherIcon(weather.condition)}
                    <span className="text-sm font-bold text-slate-200">{weather.temp.toFixed(1)}°C</span>
                </>
            ) : (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            )}
        </div>
    );
};
