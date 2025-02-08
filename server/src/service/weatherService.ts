import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
    lat: number;
    lon: number;
}

interface Weather {
    city: string;
    date: string;
    icon: string;
    iconDescription: string;
    tempF: string;
    windSpeed: string;
    humidity: string;
}

class WeatherService {
    baseUrl = `${process.env.API_BASE_URL}`;
    apiKey = `${process.env.API_KEY}`;
    private async openWeatherMapCall(route: string, object: Record<string, string | number>) {
        const params = new URLSearchParams({
            appid: this.apiKey,
            ...object
        });
        return await fetch(this.baseUrl + route + "?" + params.toString());
    }
    private async fetchLocationData(query: string): Promise<Coordinates | null> {
        const res = await this.openWeatherMapCall("geo/1.0/direct", { q: query, limit: 1 });
        const data = await res.json() as any[];
        if (data.length < 1) return null
        const [ { lat, lon } ] = data;
        return { lat, lon };
    }
    private async fetchWeatherData({ lat, lon }: Coordinates) {
        const res = await this.openWeatherMapCall("data/2.5/forecast", { lat, lon, units: "imperial" })
        const data = await res.json();
        return data;
    }
    private async parseWeatherData(data: any): Promise<Weather[]> {
        const weatherList: Weather[] = [];
        const city = data.city.name;
        let today = true;
        for (const day of data.list) {
            if (!today && !day.dt_txt.includes("12:00:00")) continue;
            today = false;
            weatherList.push({
                city,
                date: dayjs(day.dt * 1000).format("MM/DD/YYYY"),
                icon: day.weather[0].icon,
                iconDescription: day.weather[0].description,
                tempF: day.main.temp,
                windSpeed: day.wind.speed,
                humidity: day.main.humidity
            });
        }
        return weatherList;
    }
    async getWeatherForCity(city: string): Promise<Weather[] | null> {
        const location = await this.fetchLocationData(city);
        if (location === null) return null;
        const weatherData = await this.fetchWeatherData(location);
        const weather = await this.parseWeatherData(weatherData);
        return weather;
    }
}

export default new WeatherService();
