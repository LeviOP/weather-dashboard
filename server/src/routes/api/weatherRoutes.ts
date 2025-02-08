import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
    // TODO: GET weather data from city name
    // TODO: save city to search history
    const { cityName } = req.body as { cityName: string };
    const weather = await WeatherService.getWeatherForCity(cityName);
    if (weather === null) {
        res.sendStatus(404);
    } else {
        res.send(weather);
        HistoryService.addCity(cityName);
    }
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
    const cities = await HistoryService.getCities();
    res.send(cities);
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
    const ok = await HistoryService.removeCity(req.params.id);
    if (!ok) res.sendStatus(404);
    else res.sendStatus(200);
});

export default router;
