const AppState = {
    dadosClima: null,
    dadosPrevisao: null,
    unidade: 'C',
    graficoInstance: null,

    getFavoritos() {
        return JSON.parse(localStorage.getItem('favoritos') || '[]');
    },
    
    salvarFavoritos(lista) {
        localStorage.setItem('favoritos', JSON.stringify(lista));
    }
};

export default AppState;