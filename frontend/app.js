import {getPrevisaoTempo} from "../backend/Services/buscaPrevisao.js";

try {
    const clima = await getPrevisaoTempo("Joaçaba");   
    console.log({
        cidade:clima.name,
        temperatura:clima.main.temp,
        descricao:clima.weather[0].description,
        umidade:clima.main.humidity,
    });
} catch (error) {
  console.error("Erro:", error.message);
}