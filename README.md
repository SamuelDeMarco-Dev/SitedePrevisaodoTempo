# ClimaTempo — Site de Previsão do Tempo

Aplicação web de previsão do tempo desenvolvida com Node.js + Express no backend e JavaScript vanilla no frontend, seguindo o padrão arquitetural **MVC (Model-View-Controller)**. Integra a API OpenWeatherMap para exibir clima atual, previsão de 5 dias, gráfico horário de temperatura, geolocalização automática e favoritos persistentes.

**Autor:** Samuel De Marco | **Licença:** ISC

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Clima em tempo real | Temperatura, umidade, vento e sensação térmica |
| Previsão 5 dias | Cards diários com ícone, temperatura e min/max |
| Gráfico horário | Linha da temperatura do dia atual via Chart.js |
| Autocomplete | Sugestões de cidades com debounce de 400ms |
| Geolocalização | Detecta a cidade do usuário automaticamente pelo GPS |
| Favoritos | Salva cidades preferidas no localStorage |
| °C / °F | Converte temperatura ao vivo em toda a interface |
| Tema dark/light | Alternância com persistência via localStorage |

---

## Stack Tecnológico

| Pacote | Versão | Função |
|---|---|---|
| `express` | ^5.2.1 | Servidor HTTP; registra rotas REST e serve o frontend |
| `cors` | ^2.8.6 | Libera requisições cross-origin (browser → servidor) |
| `dotenv` | ^17.4.2 | Carrega variáveis do `.env` em `process.env` sem expô-las no código |
| Chart.js (CDN) | Última estável | Gráfico de linha para evolução horária da temperatura |
| OpenWeatherMap API | v2.5 | Fonte de dados: clima atual, forecast e geocoding |
| ES Modules (nativo) | Node.js 18+ | `type: "module"` habilita `import/export` sem transpilação |

---

## Arquitetura MVC

O projeto adota o padrão **MVC** para separar responsabilidades entre camadas:

```
Requisição HTTP
      ↓
   Routes          ← mapeia URLs para controllers
      ↓
  Controllers      ← valida entrada, chama service, formata resposta
      ↓
   Services        ← chama a API externa (OpenWeatherMap)
      ↓
    Models         ← transforma o dado bruto em DTO limpo
```

No **frontend**, o padrão é aplicado com JavaScript vanilla:

```
Evento do usuário
      ↓
  Controller       ← captura eventos, chama api.js, atualiza o Model
      ↓
    Model          ← estado centralizado (AppState)
      ↓
    Views          ← funções puras de renderização de DOM
```

---

## Estrutura do Projeto

```
SitedePrevisaodoTempo/
│
├── backend/
│   ├── server.js                          # Inicialização do Express e registro de middlewares
│   ├── Routes/
│   │   ├── climaRoutes.js                 # Rotas: /api/clima, /api/previsao5dias
│   │   └── geocodingRoutes.js             # Rotas: /api/cidades, /api/cidade-por-coords
│   ├── Controllers/
│   │   ├── climaController.js             # Handlers HTTP de clima e previsão
│   │   └── geocodingController.js         # Handlers HTTP de geocoding
│   ├── Services/
│   │   ├── buscaPrevisao.js               # Chama /data/2.5/weather
│   │   ├── buscaPrevisao5dias.js          # Chama /data/2.5/forecast
│   │   └── geocoding.js                   # Chama geo/1.0/direct e geo/1.0/reverse
│   └── Models/
│       └── Clima.js                       # DTO que formata o dado bruto do clima atual
│
├── frontend/
│   ├── index.html                         # Estrutura HTML da aplicação
│   ├── style.css                          # Estilos com variáveis CSS (dark/light)
│   ├── app.js                             # Entry point: importa o AppController
│   └── js/
│       ├── model/
│       │   └── AppState.js                # Estado global centralizado
│       ├── view/
│       │   ├── climaView.js               # Renderiza clima atual e temperatura
│       │   ├── previsaoView.js            # Renderiza cards de 5 dias e gráfico
│       │   ├── favoritosView.js           # Renderiza lista de favoritos
│       │   └── uiView.js                  # Gerencia estados de UI (loading, erro)
│       └── controller/
│           ├── api.js                     # Fetch calls ao backend
│           └── AppController.js           # Event listeners e orquestração
│
├── .env                                   # Credenciais da API (não commitado)
├── .gitignore
├── package.json
└── package-lock.json
```

---

## Instalação e Execução

**1. Clonar o repositório**
```bash
git clone https://github.com/seu-usuario/SitedePrevisaodoTempo.git
cd SitedePrevisaodoTempo
```

**2. Instalar dependências**
```bash
npm install
```

**3. Criar o arquivo `.env`**

Obtenha sua chave em [openweathermap.org/api](https://openweathermap.org/api) e crie o arquivo na raiz:
```env
OPEN_WEATHER_API_KEY=sua_chave_aqui
```

**4. Executar**
```bash
# Produção
npm start

# Desenvolvimento (auto-reload com --watch)
npm run dev
```

**5. Acessar**
```
http://localhost:3000
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `OPEN_WEATHER_API_KEY` | Sim | Chave de autenticação da OpenWeatherMap. Usada nos três services do backend. |
| `PORT` | Não | Porta do servidor. Padrão: `3000`. Útil para plataformas de deploy com porta dinâmica. |

> **Segurança:** `.env` está no `.gitignore` e nunca deve ser commitado. Em produção, configure as variáveis diretamente no painel do serviço de hospedagem.

---

## Endpoints da API

Todos retornam JSON e respondem com `400` em caso de erro.

### `GET /api/clima`
Retorna o clima atual de uma cidade formatado pelo DTO `Clima`.
- **Query param:** `cidade` — nome da cidade (ex.: `?cidade=São Paulo`)
- **Controller:** `climaController.getClima()`
- **Service:** `buscaPrevisao.getPrevisaoTempo()`
- **Resposta:** `{ cidade, temperatura, sensacao, umidade, vento, descricao, icone }`

### `GET /api/previsao5dias`
Retorna até 40 entradas de previsão em intervalos de 3 horas (~5 dias).
- **Query param:** `cidade`
- **Controller:** `climaController.getPrevisao5dias()`
- **Service:** `buscaPrevisao5dias.getPrevisaoTempo5dias()`
- **Resposta:** objeto com array `list[]` da OpenWeatherMap

### `GET /api/cidades`
Retorna até 5 sugestões de cidades para autocomplete.
- **Query param:** `q` — texto parcial (ex.: `?q=São`)
- **Controller:** `geocodingController.getCidades()`
- **Service:** `geocoding.getGeocoding()`
- **Resposta:** `[{ nome, estado, pais, lat, lon }]`

### `GET /api/cidade-por-coords`
Geocoding reverso: converte coordenadas em nome de cidade.
- **Query params:** `lat`, `lon`
- **Controller:** `geocodingController.getCidadePorCoordenadas()`
- **Service:** `geocoding.getCidadePorCoordenadas()`
- **Resposta:** `{ nome }`

---

## Documentação do Backend

### `backend/server.js`

Ponto de entrada do backend. Responsabilidade única: configurar o Express e montar os roteadores. Não define rotas diretamente.

```js
app.use(cors());
app.use(express.static('../frontend'));
app.use('/api', climaRoutes);
app.use('/api', geocodingRoutes);
```

**Ordem dos middlewares:** `cors()` e `static` são registrados antes das rotas. O Express processa na ordem de registro — registrar rotas antes do `cors` faria requisições serem respondidas sem os headers corretos.

---

### `backend/Routes/`

Mapeiam URLs para funções de controller usando `express.Router()`. Não contêm lógica.

| Arquivo | Rota | Controller |
|---|---|---|
| `climaRoutes.js` | `GET /clima` | `getClima` |
| `climaRoutes.js` | `GET /previsao5dias` | `getPrevisao5dias` |
| `geocodingRoutes.js` | `GET /cidades` | `getCidades` |
| `geocodingRoutes.js` | `GET /cidade-por-coords` | `getCidadePorCoordenadas` |

---

### `backend/Controllers/`

Recebem `req` e `res` do Express. Extraem parâmetros de `req.query`, delegam para o service e formatam a resposta. Tratam erros com `try/catch` — nunca deixam uma exceção derrubar o servidor.

**`climaController.js`**

```js
export async function getClima(req, res) {
    const { cidade } = req.query;
    try {
        const dados = await getPrevisaoTempo(cidade);
        res.json(new Clima(dados));         // aplica o DTO antes de responder
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
}
```

**Alias de import para evitar conflito de nomes:** quando o service e o controller teriam o mesmo nome, usa-se `import { fn as fnService }` para distinguir os dois no mesmo escopo.

```js
import { getPrevisaoTempo5dias as getPrevisao5diasService } from '../Services/buscaPrevisao5dias.js';
import { getCidadePorCoordenadas as getCidadeService } from '../Services/geocoding.js';
```

---

### `backend/Services/`

Encapsulam as chamadas à API externa. Validam pré-condições (`cidade`, `API_KEY`) antes de qualquer requisição de rede, lançando erros descritivos que sobem até o controller.

**Parâmetros enviados à OpenWeatherMap:**

| Parâmetro | Valor | Motivo |
|---|---|---|
| `q` | `"Cidade,BR"` | Sufixo `,BR` restringe ao Brasil, evita conflitos com homônimas internacionais |
| `units` | `metric` | Retorna temperatura em Celsius; conversão para °F feita no frontend |
| `lang` | `pt_br` | Descrição em português ("chuva leve" em vez de "light rain") |
| `cnt` | `40` | Limita forecast a 5 dias × 8 intervalos de 3h; reduz payload |

**Comparativo dos endpoints:**

| | `buscaPrevisao.js` | `buscaPrevisao5dias.js` |
|---|---|---|
| Endpoint | `/data/2.5/weather` | `/data/2.5/forecast` |
| Parâmetro extra | — | `cnt: 40` |
| Estrutura da resposta | Objeto único | Objeto com array `list[]` |

---

### `backend/Models/Clima.js`

DTO (Data Transfer Object) que transforma o dado bruto da OpenWeatherMap em um objeto com apenas os campos necessários para o frontend. O frontend deixa de depender da estrutura interna da API — se a OpenWeatherMap mudar o formato, só este arquivo precisa ser ajustado.

```js
export class Clima {
    constructor(raw) {
        this.cidade      = raw.name;
        this.temperatura = raw.main.temp;
        this.sensacao    = raw.main.feels_like;
        this.umidade     = raw.main.humidity;
        this.vento       = raw.wind.speed;
        this.descricao   = raw.weather[0].description;
        this.icone       = raw.weather[0].icon;
    }
}
```

> `raw.weather` é um array — a API retorna uma lista de condições, mesmo que seja só uma. `[0]` acessa a condição principal.

---

## Documentação do Frontend

### `frontend/app.js` — Entry Point

Arquivo mínimo: importa o controller principal e nada mais. Mantido para que o `index.html` não precise conhecer a estrutura interna de pastas.

```js
import './js/controller/AppController.js';
```

---

### `frontend/js/model/AppState.js`

Estado global centralizado da aplicação. Em vez de variáveis soltas espalhadas pelo código, todo o estado fica em um único objeto — facilita rastrear onde e como os dados mudam.

```js
const AppState = {
    dadosClima:      null,   // último resultado de /api/clima (DTO Clima)
    dadosPrevisao:   null,   // array list[] de /api/previsao5dias
    unidade:         'C',    // 'C' ou 'F' — lido por todas as views
    graficoInstance: null,   // referência ao Chart.js ativo

    getFavoritos()      { return JSON.parse(localStorage.getItem('favoritos') || '[]'); },
    salvarFavoritos(l)  { localStorage.setItem('favoritos', JSON.stringify(l)); }
};
```

`dadosClima` e `dadosPrevisao` são mantidos em memória para que a troca de unidade (°C/°F) funcione sem nova requisição à API.

`graficoInstance` precisa ser mantida para chamar `.destroy()` antes de recriar o gráfico — sem isso, cada busca acumula instâncias do Chart.js na memória (memory leak).

---

### `frontend/js/view/`

Views são **funções puras de renderização**: recebem dados como parâmetros, atualizam o DOM e não fazem fetch nem acessam estado global por conta própria.

#### `climaView.js`

| Função | Parâmetros | Responsabilidade |
|---|---|---|
| `renderizarClima(dados, unidade)` | DTO `Clima`, `'C'\|'F'` | Preenche nome, ícone, descrição, umidade, vento e chama `atualizarTemperatura` |
| `atualizarTemperatura(dados, unidade)` | DTO `Clima`, `'C'\|'F'` | Atualiza apenas os campos de temperatura sem re-renderizar o bloco inteiro |

`converterTemp(celsius, unidade)` é uma função **privada** (sem `export`) — utilizada internamente pelas duas funções acima. Aplica `(C × 9/5) + 32` para Fahrenheit e arredonda para inteiro.

#### `previsaoView.js`

| Função | Parâmetros | Responsabilidade |
|---|---|---|
| `renderizarPrevisao(dados, unidade)` | `list[]`, `'C'\|'F'` | Transforma 40 entradas em 5 cards diários |
| `renderizarGrafico(dados, unidade)` | `list[]`, `'C'\|'F'` | Cria gráfico de linha com Chart.js para o dia atual |

**Lógica de seleção de dias em `renderizarPrevisao`:**
- Agrupa entradas por data (`dt` convertido para `toLocaleDateString`)
- Para cada dia, seleciona a entrada mais próxima do meio-dia (mais representativa)
- Exclui o dia atual (já exibido no bloco principal)
- Limita a 5 dias com `.slice(0, 5)`

**`AppState.graficoInstance`** é destruída antes de criar novo gráfico:
```js
if (AppState.graficoInstance) AppState.graficoInstance.destroy();
AppState.graficoInstance = new Chart(ctx, { ... });
```

#### `favoritosView.js`

`renderizarFavoritos()` lê `AppState.getFavoritos()` e renderiza botões com `data-cidade`. O event listener de clique nesses botões fica no `AppController` — a view não registra eventos.

#### `uiView.js`

`mostrarEstado(tipo, mensagem?)` — máquina de estados da UI:

| `tipo` | Comportamento |
|---|---|
| `'carregando'` | Exibe spinner; oculta seções de conteúdo |
| `'erro'` | Exibe mensagem + botão "Tentar novamente" |
| `null` | Oculta o container de feedback |

---

### `frontend/js/controller/api.js`

Encapsula todos os `fetch` ao backend. Cada função valida a resposta HTTP, lança `Error` com a mensagem do servidor se `!res.ok`, e retorna o JSON parseado diretamente.

| Função | Endpoint chamado |
|---|---|
| `buscarClima(cidade)` | `GET /api/clima?cidade=` |
| `buscarPrevisao5dias(cidade)` | `GET /api/previsao5dias?cidade=` |
| `buscarSugestoes(texto)` | `GET /api/cidades?q=` (retorna `[]` se `texto.length < 2`) |
| `buscarCidadePorCoordenadas(lat, lon)` | `GET /api/cidade-por-coords?lat=&lon=` |

O controller nunca faz `fetch` diretamente — delega sempre para este módulo.

---

### `frontend/js/controller/AppController.js`

Arquivo central do frontend: registra todos os event listeners e orquestra o fluxo Model → View.

**`buscarClima(cidade)`** — função principal:

1. `mostrarEstado('carregando')` — exibe spinner
2. `Promise.all([Api.buscarClima, Api.buscarPrevisao5dias])` — requisições paralelas
3. Armazena resultados em `AppState.dadosClima` e `AppState.dadosPrevisao`
4. Chama `renderizarClima`, `renderizarPrevisao` e `renderizarGrafico`
5. `mostrarEstado(null)` — remove o loading
6. `catch` → `mostrarEstado('erro', erro.message)`

**Event listeners registrados:**

| Elemento | Evento | Ação |
|---|---|---|
| `#btn-tema` | `click` | Alterna `data-theme` no `<html>` e persiste no localStorage |
| `#btn-unidade` | `click` | Alterna `AppState.unidade`, re-renderiza temperatura e gráfico |
| `#input-cidade` | `input` | `Api.buscarSugestoes` com debounce de 400ms |
| `#autocomplete-lista` | `click` | Preenche input e chama `buscarClima` |
| `#btn-geolocal` | `click` | Solicita GPS, converte coords em cidade via `Api.buscarCidadePorCoordenadas` |

**`debounce(fn, delay)`** — definida localmente. HOF (Higher-Order Function) que atrasa a execução e cancela chamadas anteriores a cada novo evento. Evita uma requisição de API por tecla digitada.

---

## Fluxo de Dados Completo

```
Usuário digita cidade
        ↓ (debounce 400ms)
Api.buscarSugestoes(texto)
        ↓
GET /api/cidades?q=texto  →  geocodingController  →  geocoding.js  →  OpenWeatherMap geo/1.0/direct
        ↓
favoritosView.renderizarFavoritos()  ←  lista renderizada no autocomplete

Usuário seleciona cidade
        ↓
AppController.buscarClima(cidade)
        ↓
Promise.all([
  Api.buscarClima(cidade)          →  climaController   →  buscaPrevisao.js    →  /data/2.5/weather
  Api.buscarPrevisao5dias(cidade)  →  climaController   →  buscaPrevisao5dias  →  /data/2.5/forecast
])
        ↓
AppState.dadosClima = DTO Clima (formatado pelo Models/Clima.js)
AppState.dadosPrevisao = list[] (dado bruto da API)
        ↓
climaView.renderizarClima()
previsaoView.renderizarPrevisao()
previsaoView.renderizarGrafico()
        ↓
UI atualizada
```

---

## Decisões Técnicas

**Padrão MVC**
Separa responsabilidades em camadas independentes. Controllers não conhecem HTML; Views não fazem fetch; Services não sabem de HTTP. Cada camada pode ser modificada ou testada sem afetar as outras.

**DTO no backend (`Models/Clima.js`)**
O frontend recebe apenas os campos que usa. Se a OpenWeatherMap alterar a estrutura da resposta, só o Model precisa ser ajustado — as Views permanecem intactas.

**`import { fn as alias }` para evitar conflito de nomes**
Quando o service e o controller têm o mesmo nome de função, o alias no import (`getPrevisaoTempo5dias as getPrevisao5diasService`) evita redeclaração no mesmo escopo.

**ES Modules no backend e frontend**
`type: "module"` no `package.json` alinha a sintaxe dos dois lados sem Babel ou transpilação. Requer Node.js 18+.

**`Promise.all` para requisições paralelas**
Clima atual e previsão de 5 dias são independentes. Buscados simultaneamente — tempo total é o da mais lenta, não a soma das duas.

**Dados em Celsius, conversão no frontend**
A API sempre retorna `units=metric`. Toda conversão para °F acontece via `converterTemp()` nas Views. Evita duas chamadas de API e mantém uma única fonte de verdade.

**Debounce de 400ms no autocomplete**
Sem debounce, cada keystroke dispararia uma chamada de API. Com 400ms, só executa quando o usuário para de digitar — preserva a cota do plano gratuito (60 req/min).

**`graficoInstance.destroy()` antes de criar novo gráfico**
O Chart.js anexa event listeners e objetos internos à `<canvas>`. Criar novo gráfico sem destruir o anterior acumula objetos na memória a cada busca (memory leak).

**`encodeURIComponent` nas chamadas de fetch**
Nomes com acentos ou espaços ("São Paulo") precisam ser codificados para URL. `encodeURIComponent()` garante que a requisição chegue corretamente ao servidor.

**Sufixo `,BR` nas queries de cidade**
Restringe resultados ao Brasil, evitando que "Vitória" retorne cidades de outros países antes da cidade brasileira.

**`data-cidade` em vez de `onclick` inline nos favoritos**
ES Modules não expõem funções no escopo global — `onclick="buscarClima(...)"` no HTML quebraria. O controller usa `addEventListener` com leitura de `dataset.cidade` para capturar o clique.