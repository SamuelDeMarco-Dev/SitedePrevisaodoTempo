# ClimaTempo — Site de Previsão do Tempo

Aplicação web de previsão do tempo desenvolvida com Node.js + Express no backend e JavaScript vanilla no frontend. Integra a API OpenWeatherMap para exibir clima atual, previsão de 5 dias, gráfico horário de temperatura e geolocalização automática.

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
| `express` | ^5.2.1 | Servidor HTTP; rota das APIs REST e servir o frontend |
| `cors` | ^2.8.6 | Middleware que libera requisições cross-origin (browser → servidor) |
| `dotenv` | ^17.4.2 | Carrega variáveis do `.env` em `process.env` sem expô-las no código |
| Chart.js (CDN) | Última estável | Gráfico de linha para evolução horária da temperatura |
| OpenWeatherMap API | v2.5 | Fonte de todos os dados: clima, forecast e geocoding |
| ES Modules (nativo) | Node.js 18+ | `type: "module"` no `package.json` habilita `import/export` sem transpilação |

---

## Estrutura do Projeto

```
SitedePrevisaodoTempo/
├── backend/
│   ├── server.js                    # Servidor Express + rotas REST
│   └── Services/
│       ├── buscaPrevisao.js         # Clima atual (OpenWeatherMap /weather)
│       ├── buscaPrevisao5dias.js    # Previsão 5 dias (/forecast)
│       └── geocoding.js             # Autocomplete e geocoding reverso
├── frontend/
│   ├── index.html                   # Estrutura HTML da aplicação
│   ├── app.js                       # Toda a lógica client-side
│   └── style.css                    # Estilos com variáveis CSS (dark/light)
├── .env                             # Credenciais da API (não commitado)
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
URL_API=https://api.openweathermap.org/data/2.5/weather
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
| `OPEN_WEATHER_API_KEY` | Sim | Chave de autenticação da OpenWeatherMap. Usada nos três serviços do backend. |
| `URL_API` | Sim | URL base do endpoint de clima atual (`https://api.openweathermap.org/data/2.5/weather`). Separar da chave permite trocar o endpoint sem alterar o código. |
| `PORT` | Não | Porta do servidor. Padrão: `3000`. Útil para plataformas de deploy com porta dinâmica. |

> **Segurança:** `.env` está no `.gitignore` e nunca deve ser commitado. Em produção, configure as variáveis diretamente no painel do serviço de hospedagem.

---

## Endpoints da API

Todos retornam JSON e respondem com `400` em caso de erro.

### `GET /api/clima`
Retorna o clima atual de uma cidade.
- **Query param:** `cidade` — nome da cidade (ex.: `?cidade=São Paulo`)
- **Delega para:** `buscaPrevisao.js → getPrevisaoTempo()`

### `GET /api/previsao5dias`
Retorna até 40 entradas de previsão em intervalos de 3 horas (~5 dias).
- **Query param:** `cidade`
- **Delega para:** `buscaPrevisao5dias.js → getPrevisaoTempo5dias()`

### `GET /api/cidades`
Retorna até 5 sugestões de cidades para autocomplete.
- **Query param:** `q` — texto parcial (ex.: `?q=São`)
- **Delega para:** `geocoding.js → getGeocoding()`

### `GET /api/cidade-por-coords`
Geocoding reverso: converte coordenadas em nome de cidade.
- **Query params:** `lat`, `lon`
- **Delega para:** `geocoding.js → getCidadePorCoordenadas()`

---

## Documentação do Backend

### `backend/server.js`

Ponto de entrada do backend. Configura o Express, aplica middlewares e registra as quatro rotas. Usa ES Modules (`import/export`).

**`cors()`** — middleware aplicado globalmente. Sem ele, o browser bloquearia as chamadas de `fetch` do frontend por política de segurança (CORS). Necessário especialmente durante o desenvolvimento, quando frontend e backend podem rodar em origens diferentes.

**`express.static('../frontend')`** — serve os arquivos estáticos do frontend pelo mesmo processo do servidor. Acessar `localhost:3000` já entrega o `index.html` automaticamente, sem precisar de um servidor separado.

**Handlers de rota** — todos seguem o mesmo padrão: extraem parâmetros de `req.query`, delegam para o service correspondente com `await`, retornam JSON ou respondem com `res.status(400).json({ erro })` em caso de falha. Erros nunca derrubam o servidor — são capturados pelo bloco `try/catch` de cada handler.

---

### `backend/Services/buscaPrevisao.js`

#### `getPrevisaoTempo(cidade)` — async

Busca o estado atual do clima. Valida que `cidade`, `API_KEY` e `URL_API` existem antes de qualquer chamada de rede, lançando erro com mensagem descritiva se algum faltar.

**Parâmetros enviados à OpenWeatherMap:**

| Parâmetro | Valor | Motivo |
|---|---|---|
| `q` | `"Cidade,BR"` | O sufixo `,BR` restringe ao Brasil, evitando conflitos com cidades homônimas em outros países |
| `units` | `metric` | Retorna temperatura em Celsius; a conversão para °F é feita no frontend |
| `lang` | `pt_br` | Descrição do clima em português ("chuva leve" em vez de "light rain") |
| `appid` | `process.env.OPEN_WEATHER_API_KEY` | Chave lida do ambiente, nunca hardcoded no código-fonte |

**Retorna:** objeto JSON bruto da API com `name`, `main` (temp, humidity, feels_like, pressure), `weather` (icon, description), `wind` e `clouds`.

---

### `backend/Services/buscaPrevisao5dias.js`

#### `getPrevisaoTempo5dias(cidade)` — async

Estrutura idêntica ao `getPrevisaoTempo`, mas aponta para o endpoint `/data/2.5/forecast` e passa `cnt=40`, limitando a resposta a 40 entradas (5 dias × 8 intervalos de 3h). Isso evita trazer dados desnecessários e reduz o tamanho do payload.

| | `buscaPrevisao.js` | `buscaPrevisao5dias.js` |
|---|---|---|
| Endpoint | `/data/2.5/weather` | `/data/2.5/forecast` |
| Parâmetro extra | — | `cnt: 40` |
| Estrutura da resposta | Objeto único | Objeto com array `list[]` |
| Uso | Temperatura atual | Cards diários + gráfico |

**Retorna:** objeto com propriedade `list` — array de objetos, cada um com `dt` (timestamp Unix), `main`, `weather`, `wind` e `dt_txt` (data/hora em string ISO).

---

### `backend/Services/geocoding.js`

#### `getGeocoding(query)` — async

Busca cidades cujo nome corresponde ao texto digitado. Retorna array vazio imediatamente se `query` for falsy, evitando requisições desnecessárias. Usa o endpoint `geo/1.0/direct` com `limit=5`.

**Transformação de dados:** a resposta bruta da API é mapeada para um objeto simplificado. O campo `nome` usa preferencialmente o nome em português (`local_names.pt`) com fallback para o nome em inglês — garante que cidades com nomes diferentes por idioma apareçam corretamente.

```js
// API bruta → após .map()
{ nome: "São Paulo", estado: "São Paulo", pais: "BR", lat: -23.5, lon: -46.6 }
```

**Retorna:** `Array<{nome, estado, pais, lat, lon}>` com até 5 resultados.

---

#### `getCidadePorCoordenadas(lat, lon)` — async

Geocoding reverso: converte coordenadas geográficas em nome de cidade. Usa o endpoint `geo/1.0/reverse` com `limit=1` — apenas um resultado é necessário porque as coordenadas GPS já são exatas.

Acionada exclusivamente pela rota `/api/cidade-por-coords`, que é chamada após o navegador fornecer as coordenadas via Geolocation API.

**Retorna:** `{nome: string}` — apenas o nome da cidade, que é usado para preencher o input e disparar a busca completa.

---

## Documentação do Frontend

### `frontend/index.html`

Define a estrutura semântica da aplicação. Seções de conteúdo dinâmico são inicialmente ocultas; `app.js` as exibe conforme os dados chegam.

| Elemento | Propósito |
|---|---|
| `data-theme="dark"` no `<html>` | Ponto de controle do tema. CSS usa este atributo para selecionar variáveis corretas sem JS adicional |
| `autocomplete="off"` no input | Desabilita o autocomplete nativo para não conflitar com o sistema customizado do app |
| Botão 📍 | Dispara o fluxo de geolocalização, separado do input para UX clara |
| `#lista-autocomplete` | Lista oculta populada dinamicamente por `buscarSugestoes()` |
| `#status-feedback` | Container único para loading spinner e erros — alterna estados via `mostrarEstado()` |
| `canvas#grafico-temp` | Ponto de montagem do Chart.js para o gráfico de linha horário |
| `#previsao-container` | Container dos cards de 5 dias, populado via `innerHTML` por `renderizarPrevisao()` |
| Chart.js com `defer` | `defer` garante carregamento sem bloquear a renderização inicial do HTML |

---

### `frontend/style.css`

Implementa o sistema de tema claro/escuro usando variáveis CSS nativas, sem JavaScript adicional para troca de estilos. O atributo `data-theme` no `<html>` é o único interruptor necessário.

```css
[data-theme="dark"] {
  --bg:          #0f172a;  /* fundo — azul escuro profundo */
  --surface:     #1e293b;  /* cards — slate médio */
  --texto:       #e2e8f0;  /* texto principal — cinza claro */
  --texto-muted: #94a3b8;  /* texto secundário */
  --accent:      #38bdf8;  /* destaque — azul céu */
  --borda:       rgba(148,163,184,0.15);
}
```

O tema claro sobrescreve as mesmas variáveis com valores claros. A transição de `0.3s` no `body` anima suavemente a troca entre temas.

---

### `frontend/app.js`

Arquivo central do frontend. Gerencia estado global, orquestra requisições ao backend e atualiza o DOM. JavaScript vanilla puro — sem framework.

#### Estado Global

| Variável | Tipo | Propósito |
|---|---|---|
| `dadosClima` | `object \| null` | Último resultado de `/api/clima`. Mantido em memória para que a troca de unidade funcione sem nova requisição |
| `dadosPrevisao` | `array \| null` | Lista de forecast. Reutilizada ao trocar unidade para recriar gráfico e cards |
| `unidade` | `'C' \| 'F'` | Unidade atual. Lida por todas as funções de renderização |
| `graficoInstance` | `Chart \| null` | Referência à instância ativa do Chart.js. Necessária para destruí-la antes de criar nova e evitar memory leak |

---

#### Gerenciamento de Tema

**`btnTema` click handler**

Lê `data-theme` do `<html>`, inverte entre `'dark'` e `'light'`, e persiste no `localStorage`. Na próxima visita, o tema é restaurado automaticamente na inicialização.

---

#### Autocomplete

**`debounce(fn, delay)`**

Função de ordem superior (HOF) que envolve outra função e atrasa sua execução. Cancela o timeout anterior a cada chamada; a função interna só executa se o usuário parar de digitar pelo tempo configurado.

```js
function debounce(fn, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
```

**Por que 400ms:** rápido o suficiente para parecer responsivo, lento o suficiente para evitar uma chamada de API por tecla — economizando cota da API (plano gratuito tem limite de 60 req/min).

---

**`buscarSugestoes(texto)` — async**

Chamada pelo handler de debounce. Só dispara a requisição se o texto tiver 2 ou mais caracteres. Faz `fetch` para `/api/cidades?q=texto`, renderiza os itens na `#lista-autocomplete` e esconde a lista se o array retornado estiver vazio.

O mínimo de 2 caracteres evita resultados irrelevantes e poupa chamadas à API. Cada item da lista recebe `data-cidade` para facilitar a captura no event handler de clique.

---

#### Busca de Clima

**`buscarClima(cidade)` — async**

Função central do app. Sequência de execução:

1. `mostrarEstado('carregando')` — exibe spinner e oculta seções de conteúdo
2. `Promise.all([fetch clima, fetch previsão])` — dispara as duas requisições **em paralelo**. O tempo total é o da mais lenta, não a soma das duas
3. Parseia e valida respostas — verifica `response.ok`; lança exceção com mensagem do servidor em caso de erro
4. Armazena em `dadosClima` e `dadosPrevisao` — possibilita troca de unidade sem nova requisição
5. Chama `renderizarClima()`, `renderizarPrevisao()` e `renderizarGrafico()`
6. `mostrarEstado(null)` — remove o loading; conteúdo renderizado fica visível

---

#### Renderização

**`renderizarClima(dados)`**

Atualiza nome da cidade, ícone, descrição, umidade e vento. Não calcula temperatura diretamente — delega para `atualizarTemperatura()`, que respeita a unidade atual.

---

**`renderizarPrevisao(lista)`**

Transforma as 40 entradas brutas em 5 cards diários. Lógica de seleção:

- **Agrupa por data** usando `dt_txt.split(' ')[0]` para extrair YYYY-MM-DD
- **Seleciona a entrada mais próxima do meio-dia** — mais representativa da temperatura do dia
- **Exclui hoje** — já exibido na seção principal
- **Limita a 5 dias** com `.slice(0, 5)` após a deduplicação
- **Min/Max** — varre todas as entradas do dia para os extremos reais
- Chama `converterTemp()` ao exibir valores, respeitando a unidade atual

---

**`mostrarEstado(tipo, mensagem?)`**

Máquina de estados da UI com três modos:

| `tipo` | Comportamento |
|---|---|
| `'carregando'` | Exibe spinner animado; oculta `#secao-clima`, `#grafico` e `#previsao` |
| `'erro'` | Exibe mensagem + botão "Tentar novamente"; mantém conteúdo anterior oculto |
| `null` | Oculta o container de feedback; seções de conteúdo ficam visíveis |

Centralizar essa lógica evita código de visibilidade espalhado em várias funções.

---

**`renderizarGrafico(lista)`**

Cria o gráfico de linha da temperatura do dia usando Chart.js.

- **Filtra o dia atual** comparando `dt_txt.startsWith(dataHoje)`
- **Labels:** hora e minuto de cada entrada (`HH:MM`)
- **`graficoInstance.destroy()` antes de criar:** o Chart.js anexa event listeners e objetos internos à `<canvas>`. Criar novo gráfico no mesmo canvas sem destruir o anterior causa memory leak — os objetos antigos permanecem na memória indefinidamente
- **Configurações visuais:** curva suavizada (`tension: 0.4`), área preenchida com transparência, cor de acento `#38bdf8` alinhada ao tema
- **`responsive: true`:** adapta o gráfico ao container sem quebrar o layout

---

#### Geolocalização

**`btnGeolocalizacao` click handler**

1. Verifica suporte: `if (!navigator.geolocation)` — exibe erro em browsers sem suporte
2. Chama `getCurrentPosition()` — o browser solicita permissão ao usuário
3. Em sucesso: extrai `coords.latitude` e `coords.longitude`, chama `/api/cidade-por-coords`
4. Preenche o input com o nome retornado e chama `buscarClima()`

**Tratamento de erros por código:**

| Código | Causa | Mensagem |
|---|---|---|
| `1` | Permissão negada | Solicita habilitação nas configurações |
| `2` | Posição indisponível | Informa falha de GPS |
| `3` | Timeout | Solicita nova tentativa |

> **Nota:** a Geolocation API exige HTTPS em produção. Em `localhost`, funciona sem TLS.

---

#### Favoritos

**`getFavoritos()`**
Lê o array do `localStorage` (chave `'favoritos'`). Usa `JSON.parse()` com fallback para `[]` — evita erro de parsing no primeiro acesso quando a chave não existe.

**`salvarFavoritos(lista)`**
Persiste o array como JSON no `localStorage`. Separada de `getFavoritos()` para responsabilidade única.

**`toggleFavorito(cidade)`**
Adiciona se não existir; remove se existir. Verifica com `includes()` (comparação exata). Após a operação, persiste e re-renderiza a lista.

**`renderizarFavoritos()`**
Lê os favoritos e renderiza botões clicáveis. Cada botão exibe o nome com ★ e, ao ser clicado, chama `buscarClima(cidade)`. Executada na inicialização do app para restaurar favoritos da sessão anterior.

---

#### Conversão de Temperatura

**`converterTemp(celsius)`**

Função pura. Retorna Celsius sem alteração se `unidade === 'C'`; aplica `(C × 9/5) + 32` e arredonda para inteiro em Fahrenheit. Arredonda porque decimais em °F não acrescentam informação útil ao usuário.

```js
const converterTemp = (c) =>
  unidade === 'C' ? c : Math.round(c * 9/5 + 32)
```

**`atualizarTemperatura()`**
Re-renderiza apenas os elementos de temperatura (atual e sensação térmica) sem recarregar o bloco de clima inteiro. Só age se `dadosClima !== null` — evita erro se o usuário clicar no toggle antes de qualquer busca.

**`btnUnidade` click handler**
Inverte `unidade`, chama `atualizarTemperatura()` e recria o gráfico com `renderizarGrafico(dadosPrevisao)`. O Chart.js não suporta atualização de dados em gráficos de linha sem re-renderizar, por isso a recriação completa é necessária.

---

## Fluxo de Dados Completo

```
Usuário digita
    ↓ (debounce 400ms)
GET /api/cidades?q=texto
    ↓
geocoding.js → OpenWeatherMap geo/1.0/direct
    ↓
Lista de sugestões renderizada

Usuário seleciona cidade
    ↓
buscarClima(cidade)
    ↓
Promise.all([
  GET /api/clima?cidade=X       →  buscaPrevisao.js    → /data/2.5/weather
  GET /api/previsao5dias?cidade=X → buscaPrevisao5dias.js → /data/2.5/forecast
])
    ↓
Armazena dadosClima + dadosPrevisao
    ↓
renderizarClima() + renderizarPrevisao() + renderizarGrafico()
    ↓
UI atualizada
```

---

## Decisões Técnicas

**ES Modules no backend**
`type: "module"` no `package.json` alinha a sintaxe do backend com o frontend sem Babel ou CommonJS. Requer Node.js 12+.

**`Promise.all` para requisições paralelas**
Clima atual e previsão de 5 dias são independentes. Buscados simultaneamente — tempo total é o da mais lenta, não a soma.

**Dados em Celsius, conversão no frontend**
A API retorna sempre em `units=metric`. Toda conversão para °F acontece no cliente via `converterTemp()`. Evita duas chamadas de API e mantém uma única fonte de verdade.

**Debounce no autocomplete**
Sem debounce, cada keystroke dispararia uma chamada de API. Com 400ms, só se chama quando o usuário para de digitar — preserva a cota da conta gratuita (60 req/min).

**`graficoInstance.destroy()` antes de criar novo gráfico**
O Chart.js anexa event listeners à `<canvas>`. Criar novo gráfico sem destruir o anterior acumula objetos na memória a cada busca.

**`encodeURIComponent` nas chamadas de fetch**
Nomes de cidades com acentos ou espaços (ex.: "São Paulo") precisam ser codificados para URL. `encodeURIComponent()` transforma `ã` em `%C3%A3`, garantindo que a requisição chegue corretamente ao servidor.

**Sufixo `,BR` nas queries de cidade**
Restringe resultados ao Brasil, evitando que "Vitória" retorne cidades de outros países antes da cidade brasileira.
