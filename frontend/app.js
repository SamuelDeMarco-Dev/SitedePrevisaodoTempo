const html = document.documentElement;

document.getElementById('btn-tema').addEventListener('click', () => {
    const atual = html.getAttribute('data-theme');
    const novo = atual === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', novo);

    localStorage.setItem('tema', novo);
});

const inputCidade = document.getElementById('input-cidade');
const listaAuto = document.getElementById('autocomplete-lista');

function debounce(fn, delay){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

async function buscarSugestoes(texto){
    if(texto.length < 2){
        listaAuto.hidden = true;
        return;
    }

    const response = await fetch(`/api/cidades?q=${encodeURIComponent(texto)}`);
    const cidades = await response.json();

    listaAuto.innerHTML = cidades.map(c => 
        `<li role="option" data-nome="${c.nome},${c.pais}">
            ${c.nome}${c.estado ? ', ' + c.estado : ''} - ${c.pais}
        </li>`
    ).join('');
    listaAuto.hidden = cidades.length === 0;
}

inputCidade.addEventListener('input', debounce(e => 
    buscarSugestoes(e.target.value), 400
));

listaAuto.addEventListener('click', e => {
    if(e.target.tagName !== 'LI') return;
    inputCidade.value = e.target.dataset.nome;
    listaAuto.hidden = true;
    buscarClima(e.target.dataset.nome);
})

// Estado global — armazena os dados brutos em Celsius
let dadosClima = null;
let unidade = 'C'; // 'C' ou 'F'

async function buscarClima(cidade) {
  mostrarEstado('carregando');

  try {
    // Busca paralela: clima atual + previsão 5 dias ao mesmo tempo
    const [resClima, resPrevisao] = await Promise.all([
      fetch(`/api/clima?cidade=${encodeURIComponent(cidade)}`),
      fetch(`/api/previsao5dias?cidade=${encodeURIComponent(cidade)}`),
    ]);

    if (!resClima.ok) {
      const { erro } = await resClima.json();
      throw new Error(erro || "Cidade não encontrada");
    }

    dadosClima = await resClima.json();
    const previsao = await resPrevisao.json();

    renderizarClima(dadosClima);
    renderizarPrevisao(previsao.list);
    renderizarGrafico(previsao.list);
    mostrarEstado(null); // esconde loading

  } catch (error) {
    mostrarEstado('erro', error.message);
  }
}

function renderizarClima(dados) {
  const { name, main, weather, wind } = dados;
  document.getElementById('nome-cidade').textContent = name;
  document.getElementById('descricao-clima').textContent = weather[0].description;
  document.getElementById('icone-clima').src =
    `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  document.getElementById('umidade').textContent = `${main.humidity}%`;
  document.getElementById('vento').textContent = `${wind.speed} m/s`;
  atualizarTemperatura(); // respeita a unidade escolhida

  document.getElementById('clima-atual').hidden = false;
}

function mostrarEstado(tipo, mensagem = '') {
  const el = document.getElementById('estado');
  const secoes = ['clima-atual', 'grafico-section', 'previsao-section'];

  if (tipo === null) {
    el.hidden = true;
    return;
  }

  // Esconde resultados enquanto carrega ou em caso de erro
  if (tipo !== null) {
    secoes.forEach(id => document.getElementById(id).hidden = true);
  }

  el.hidden = false;
  el.className = `estado estado--${tipo}`;

  const conteudo = {
    carregando: `<div class="spinner"></div> Buscando clima...`,
    erro: `⚠️ ${mensagem || 'Algo deu errado.'}
            <button onclick="document.getElementById('input-cidade').focus()">
              Tentar novamente
            </button>`,
  };

  el.innerHTML = conteudo[tipo] || '';
}

document.getElementById('btn-geolocal').addEventListener('click', () => {
  if (!navigator.geolocation) {
    mostrarEstado('erro', 'Seu browser não suporta geolocalização.');
    return;
  }

  mostrarEstado('carregando');

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;

      // 1. Descobrir o nome da cidade pelas coordenadas
      const res = await fetch(`/api/cidade-por-coords?lat=${lat}&lon=${lon}`);
      const { nome } = await res.json();

      // 2. Usar o nome para buscar o clima completo
      inputCidade.value = nome;
      buscarClima(nome);
    },
    (erro) => {
      const msgs = {
        1: 'Permissão de localização negada.',
        2: 'Localização indisponível.',
        3: 'Tempo esgotado ao obter localização.',
      };
      mostrarEstado('erro', msgs[erro.code] || 'Erro de geolocalização.');
    }
  );
});

let graficoInstance = null; // guarda referência para destruir antes de recriar

function renderizarGrafico(lista) {
  // Pega apenas os registros de hoje
  const hoje = new Date().toLocaleDateString('pt-BR');
  const dadosHoje = lista.filter(item =>
    new Date(item.dt * 1000).toLocaleDateString('pt-BR') === hoje
  );

  const labels = dadosHoje.map(item =>
    new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const temps = dadosHoje.map(item => converterTemp(item.main.temp));

  // Destrói gráfico anterior para não acumular instâncias
  if (graficoInstance) graficoInstance.destroy();

  const ctx = document.getElementById('grafico-temp');
  graficoInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Temperatura (°${unidade})`,
        data: temps,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.1)',
        tension: 0.4,     // curva suave
        fill: true,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => v + `°${unidade}` } } }
    }
  });

  document.getElementById('grafico-section').hidden = false;
}

function converterTemp(celsius) {
  if (unidade === 'C') return Math.round(celsius);
  return Math.round(celsius * 9 / 5 + 32); // fórmula °C → °F
}

function atualizarTemperatura() {
  if (!dadosClima) return;
  const temp = converterTemp(dadosClima.main.temp);
  const sensacao = converterTemp(dadosClima.main.feels_like);
  document.getElementById('temperatura').textContent = `${temp}°${unidade}`;
  document.getElementById('sensacao').textContent = `${sensacao}°${unidade}`;
}

document.getElementById('btn-unidade').addEventListener('click', () => {
  unidade = unidade === 'C' ? 'F' : 'C';
  atualizarTemperatura();
  // Recria o gráfico com a nova unidade
  if (dadosPrevisao) renderizarGrafico(dadosPrevisao);
});

function getFavoritos() {
  return JSON.parse(localStorage.getItem('favoritos') || '[]');
}

function salvarFavoritos(lista) {
  localStorage.setItem('favoritos', JSON.stringify(lista));
}

function toggleFavorito(cidade) {
  let favs = getFavoritos();
  const idx = favs.indexOf(cidade);

  if (idx === -1) {
    favs.push(cidade);
  } else {
    favs.splice(idx, 1); // remove se já existe
  }

  salvarFavoritos(favs);
  renderizarFavoritos();
  atualizarBotaoFavorito(cidade);
}

function renderizarFavoritos() {
  const favs = getFavoritos();
  const container = document.getElementById('favoritos');

  container.innerHTML = favs.map(cidade =>
    `<button class="fav-tag" onclick="buscarClima('${cidade}')">
       ★ ${cidade}
     </button>`
  ).join('');
}

// Carrega favoritos ao iniciar a página
renderizarFavoritos();