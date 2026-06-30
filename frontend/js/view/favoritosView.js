import AppState from '../model/AppState.js';

export function renderizarFavoritos() {
  const favs = AppState.getFavoritos();
  const container = document.getElementById('favoritos');

  container.innerHTML = favs.map(cidade =>
    `<button class="fav-tag" data-cidade="${cidade}">★ ${cidade}</button>`
  ).join('');
}