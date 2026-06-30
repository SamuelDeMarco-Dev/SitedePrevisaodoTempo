import AppState from '../model/AppState.js';

function converterTemp(celsius, unidade) {
    if (unidade === 'C') return Math.round(celsius);
    return Math.round(celsius * 9 / 5 + 32);
}

export function renderizarPrevisao(dados, unidade) {
  // Agrupa por dia e pega o registro mais próximo do meio-dia
  const porDia = {};
  dados.forEach(item => {
    const data = new Date(item.dt * 1000);
    const chave = data.toLocaleDateString('pt-BR');
    const hora = data.getHours();
    if (!porDia[chave] || Math.abs(hora - 12) < Math.abs(new Date(porDia[chave].dt * 1000).getHours() - 12)) {
      porDia[chave] = item;
    }
  });

  const hoje = new Date().toLocaleDateString('pt-BR');
  const dias = Object.entries(porDia).filter(([dia]) => dia !== hoje).slice(0, 5);

  const container = document.getElementById('cards-previsao');
  container.innerHTML = dias.map(([dia, item]) => {
    const temp = converterTemp(item.main.temp, unidade);
    const tempMin = converterTemp(item.main.temp_min, unidade);
    const tempMax = converterTemp(item.main.temp_max, unidade);
    const diaSemana = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    return `
      <div class="card-previsao">
        <span class="card-previsao__dia">${diaSemana}</span>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" title="${item.weather[0].description}">
        <span class="card-previsao__temp">${temp}°${unidade}</span>
        <span class="card-previsao__minmax">${tempMin}° / ${tempMax}°</span>
      </div>`;
  }).join('');

  document.getElementById('previsao-section').hidden = false;
}


export function renderizarGrafico(dados, unidade) {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const dadosHoje = dados.filter(item =>
    new Date(item.dt * 1000).toLocaleDateString('pt-BR') === hoje
  );

  const labels = dadosHoje.map(item =>
    new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const temps = dadosHoje.map(item => converterTemp(item.main.temp, unidade));

  if (AppState.graficoInstance) AppState.graficoInstance.destroy();

  const ctx = document.getElementById('grafico-temp'); // 1º define ctx
  AppState.graficoInstance = new Chart(ctx, {           // 2º usa ctx
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Temperatura (°${unidade})`,
        data: temps,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.1)',
        tension: 0.4,
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
