const API_KEY = process.env.OPEN_WEATHER_API_KEY;
const URL_API = "https://api.openweathermap.org/geo/1.0";

export async function getGeocoding(query) {
    if(!query){
        return[];
    }

    const params = new URLSearchParams({
        q: query,
        limit: 5,
        appid: API_KEY,
    });

    const request = await fetch(`${URL_API}/direct?${params}`);
    const data = await request.json();

    if(!request.ok){
        throw new Error(data.message || "Erro ao buscar geocoding.");
    }

    return data.map(c => ({
        nome: c.local_names?.pt || c.name,
        estado: c.state,
        pais: c.country,
        lat: c.lat,
        lon: c.lon
    }));
}

export async function getCidadePorCoordenadas(lat, lon) {
    const params = new URLSearchParams({
        lat: lat,
        lon: lon,
        limit: 1,
        appid: API_KEY,
    });

    const request = await fetch(`${URL_API}/reverse?${params}`);

    const [cidade] = await request.json();
    return {
        nome: cidade.local_names?.pt || cidade.name,
    }
}
