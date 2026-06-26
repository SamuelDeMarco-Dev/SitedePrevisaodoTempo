const PAIS = "BR";
const API_KEY = process.env.OPEN_WEATHER_API_KEY;
const URL_API = process.env.URL_API;

export async function getPrevisaoTempo(cidade) {
  if (!cidade) {
    throw new Error("Digite uma cidade válida!");
  }

  if (!API_KEY) {
    throw new Error("Não foi encontrada KEY para a chamada da API!");
  }

  if (!URL_API) {
    throw new Error("Não foi informada a URL base para a chamada da API!");
  }

  const params = new URLSearchParams({
    q: `${cidade},${PAIS}`,
    appid: API_KEY,
    units: "metric",
    lang: "pt_br",
  });

  const request = await fetch(`${URL_API}?${params}`);

  const result = await request.json();

  if (!request.ok) {
    throw new Error(result.message || "Erro ao buscar previsão.");
  }

  return result;
}