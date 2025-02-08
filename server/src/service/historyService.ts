import * as fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";
// TODO: Define a City class with name and id properties
class City {
    name: string;
    id: string;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }
}

// TODO: Complete the HistoryService class
class HistoryService {
    // TODO: Define a read method that reads from the searchHistory.json file
    private async read() {
        return await fs.readFile("db/searchHistory.json", { encoding: "utf-8" });
    }
    // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
    private async write(cities: City[]) {
        return await fs.writeFile("db/searchHistory.json", JSON.stringify(cities, null, 4));
    }
    // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities(): Promise<City[]> {
        const raw = await this.read();
        let rawCities: unknown;
        try {
            rawCities = JSON.parse(raw);
        } catch {
            return [];
        }
        // Unknown is safe, any is not :)
        if (!(Array.isArray as (arg: any) => arg is unknown[])(rawCities)) return [];

        const cities: City[] = [];
        for (const city of rawCities) {
            if (typeof city !== "object" || city === null) continue;
            if (!("name" in city) || typeof city.name !== "string") continue;
            if (!("id" in city) || typeof city.id !== "string") continue;
            cities.push(new City(city.name, city.id));
        }
        return cities;
    }
    // TODO Define an addCity method that adds a city to the searchHistory.json file
    async addCity(city: string) {
        if (!city) throw new Error("City name cannot be blank");

        const newCity = new City(city, uuidv4());

        return await this.getCities()
            .then((cities) => {
                return [...cities, newCity];
            })
            .then(this.write)
            .then(() => newCity)
    }
    // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
    async removeCity(id: string): Promise<boolean> {
        const cities = await this.getCities();
        const index = cities.findIndex((city) => city.id === id);
        if (index < 0) return false;
        cities.splice(index, 1);
        this.write(cities);
        return true;
    }
}

export default new HistoryService();
