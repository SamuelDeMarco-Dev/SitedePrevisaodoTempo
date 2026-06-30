export function mostrarEstado(tipo, mensagem = '') {
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