export class Clima {
    constructor(raw){
        this.cidade = raw.name;
        this.temperatura = raw.main.temp;
        this.sensacao = raw.main.feels_like;
        this.umidade = raw.main.humidity;
        this.vento = raw.wind.speed;
        this.descricao = raw.weather[0].description;
        this.icone = raw.weather[0].icon; 
    }
}