import AppState from '../model/AppState.js';
import * as Api from './api.js';
import { renderizarClima, atualizarTemperatura, atualizarBotaoFavorito } from '../view/climaView.js';
import { renderizarPrevisao, renderizarGrafico } from '../view/previsaoView.js';
import { renderizarFavoritos } from '../view/favoritosView.js';
import { mostrarEstado } from '../view/uiView.js';

const html          = document.documentElement;
const inputCidade   = document.getElementById('input-cidade');
const listaAuto     = document.getElementById('autocomplete-lista');
const containerFavs = document.getElementById('favoritos');

const temaSalvo = localStorage.getItem('tema') || 'dark';
html.setAttribute('data-theme', temaSalvo);

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

export async function buscarClima(cidade) {
    mostrarEstado('carregando');
    try {
        const [dadosClima, dadosPrevisao] = await Promise.all([
            Api.buscarClima(cidade),
            Api.buscarPrevisao5dias(cidade),
        ]);

        AppState.dadosClima    = dadosClima;
        AppState.dadosPrevisao = dadosPrevisao.list;

        renderizarClima(AppState.dadosClima, AppState.unidade);
        renderizarPrevisao(AppState.dadosPrevisao, AppState.unidade);
        renderizarGrafico(AppState.dadosPrevisao, AppState.unidade);
        atualizarBotaoFavorito(AppState.getFavoritos().includes(AppState.dadosClima.cidade));
        mostrarEstado(null);
    } catch (erro) {
        mostrarEstado('erro', erro.message);
    }
}

document.getElementById('btn-tema').addEventListener('click', () => {
    const atual = html.getAttribute('data-theme');
    const novo  = atual === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', novo);
    localStorage.setItem('tema', novo);
});

document.getElementById('btn-unidade').addEventListener('click', () => {
    AppState.unidade = AppState.unidade === 'C' ? 'F' : 'C';
    atualizarTemperatura(AppState.dadosClima, AppState.unidade);
    if (AppState.dadosPrevisao) {
        renderizarPrevisao(AppState.dadosPrevisao, AppState.unidade);
        renderizarGrafico(AppState.dadosPrevisao, AppState.unidade);
    }
});

document.getElementById('btn-favorito').addEventListener('click', () => {
    if (!AppState.dadosClima) return;
    const cidade = AppState.dadosClima.cidade;
    const favoritos = AppState.getFavoritos();
    const index = favoritos.indexOf(cidade);

    if (index === -1) favoritos.push(cidade);
    else favoritos.splice(index, 1);

    AppState.salvarFavoritos(favoritos);
    renderizarFavoritos();
    atualizarBotaoFavorito(index === -1);
});

containerFavs.addEventListener('click', e => {
    if (!e.target.classList.contains('fav-tag')) return;
    const cidade = e.target.dataset.cidade;
    inputCidade.value = cidade;
    buscarClima(cidade);
});

inputCidade.addEventListener('input', debounce(async (e) => {
    try {
        const cidades = await Api.buscarSugestoes(e.target.value);
        listaAuto.innerHTML = cidades.map(c =>
            `<li role="option" data-nome="${c.nome},${c.pais}">
                ${c.nome}${c.estado ? ', ' + c.estado : ''} - ${c.pais}
            </li>`
        ).join('');
        listaAuto.hidden = cidades.length === 0;
    } catch (erro) {
        listaAuto.hidden = true;
    }
}, 400));

listaAuto.addEventListener('click', e => {
    if (e.target.tagName !== 'LI') return;
    inputCidade.value   = e.target.dataset.nome;
    listaAuto.hidden    = true;
    buscarClima(e.target.dataset.nome);
});

document.getElementById('btn-geolocal').addEventListener('click', () => {
    if (!navigator.geolocation) {
        mostrarEstado('erro', 'Seu browser não suporta geolocalização.');
        return;
    }
    mostrarEstado('carregando');
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            try {
                const { latitude: lat, longitude: lon } = pos.coords;
                const { nome } = await Api.buscarCidadePorCoordenadas(lat, lon);
                inputCidade.value = nome;
                buscarClima(nome);
            } catch (erro) {
                mostrarEstado('erro', erro.message);
            }
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

renderizarFavoritos();