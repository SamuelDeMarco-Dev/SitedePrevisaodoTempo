import AppState from '../model/AppState.js';
import { renderizarClima } from '../view/climaView.js';
import { mostrarEstado } from '../view/uiView.js';

async function buscarClima(cidade) {
    mostrarEstado('carregando');
    
    const [resClima, resPrevisao] = await Promise.all([
        fetch(`/api/clima?cidade=${encodeURIComponent(cidade)}`),
        fetch(`/api/precisao5dias?cidade=${encodeURIComponent(cidade)}`),
    ]);

    AppState.dadosClima = await resClima.json();
    AppState.dadosPrevisao = (await resPrevisao.json()).list;

    renderizarClima(AppState.dadosClima, AppState.unidade);
    mostrarEstado(null);
}

document.getElementById('btn-tema').addEventListener('click', () => {
    const atual = html.getAttribute('data-theme');
    const novo = atual === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', novo);

    localStorage.setItem('tema', novo);
});

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

document.getElementById('btn-unidade').addEventListener('click', () => {
  unidade = unidade === 'C' ? 'F' : 'C';
  atualizarTemperatura();
  // Recria o gráfico com a nova unidade
  if (dadosPrevisao) renderizarGrafico(dadosPrevisao);
});

inputCidade.addEventListener('input', debounce(e => 
    buscarSugestoes(e.target.value), 400
));

listaAuto.addEventListener('click', e => {
    if(e.target.tagName !== 'LI') return;
    inputCidade.value = e.target.dataset.nome;
    listaAuto.hidden = true;
    buscarClima(e.target.dataset.nome);
})