const html = document.documentElement;

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

// Estado global — armazena os dados brutos em Celsius
let dadosClima = null;
let dadosPrevisao = null;
let unidade = 'C'; // 'C' ou 'F'



let graficoInstance = null; // guarda referência para destruir antes de recriar









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



// Carrega favoritos ao iniciar a página
renderizarFavoritos();