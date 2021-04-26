const fs = require('fs');
const axios = require('axios');



class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: leer BD si existe
        this.leerDB();

    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    get historialCapitalizado() {
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        });
    }

    async ciudad(lugar = '') {
        try {
            //PETICION HTTP 
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await intance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                name: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        } catch (error) {
            return [];
        }
    }

    async climaLugar(lat, lon) {
        try {
            //PETICION HTTP 
            const intance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${ lat }&lon=${ lon }`,
                params: this.paramsOpenWeather
            });

            const resp = await intance.get();
            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    agregarHistorial(lugar = '') {
        // prevenir duplicados
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }

        this.historial.unshift(lugar.toLocaleLowerCase());
        //guardar solo los 6 primeros
        this.historial = this.historial.splice(0, 5);

        this.guadarDB();
    }
    guadarDB() {
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));

    }
    leerDB() {
        if (fs.existsSync(this.dbPath)) {
            const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' })
            const data = JSON.parse(info);
            this.historial = data.historial;
        } else {
            return;
        }
    }
}

module.exports = Busquedas;