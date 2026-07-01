function converterTemp(celsius, unidade) {
  if (unidade === 'C') return Math.round(celsius);
  return Math.round(celsius * 9 / 5 + 32); // fórmula °C → °F
}

export function renderizarClima(dados, unidade) {
    document.getElementById('nome-cidade').textContent = dados.cidade;
    document.getElementById('descricao-clima').textContent = dados.descricao;
    document.getElementById('icone-clima').src =
    `https://openweathermap.org/img/wn/${dados.icone}@2x.png`;
    document.getElementById('umidade').textContent = `${dados.umidade}%`;
    document.getElementById('vento').textContent = `${dados.vento} m/s`;
    atualizarTemperatura(dados, unidade); // respeita a unidade escolhida

    document.getElementById('clima-atual').hidden = false;
}

export function atualizarTemperatura(dados, unidade) {
  if (!dados) return;
  const temp = converterTemp(dados.temperatura, unidade);
  const sensacao = converterTemp(dados.sensacao, unidade);
  document.getElementById('temperatura').textContent = `${temp}°${unidade}`;
  document.getElementById('sensacao').textContent = `${sensacao}°${unidade}`;
}

export function atualizarBotaoFavorito(favoritado) {
  const btn = document.getElementById('btn-favorito');
  btn.textContent = favoritado ? '★' : '☆';
}