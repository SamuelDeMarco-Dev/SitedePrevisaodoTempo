export async function buscarClima(cidade) {
    const res = await fetch(`/api/clima?cidade=${encodeURIComponent(cidade)}`);
    if (!res.ok) {
        const { erro } = await res.json();
        throw new Error(erro || 'Cidade não encontrada');
    }
    return res.json();
}

export async function buscarPrevisao5dias(cidade) {
    const res = await fetch(`/api/previsao5dias?cidade=${encodeURIComponent(cidade)}`);
    if (!res.ok) {
        const { erro } = await res.json();
        throw new Error(erro || 'Previsão não encontrada');
    }
    return res.json();
}

export async function buscarSugestoes(texto) {
    if (texto.length < 2) return [];
    const res = await fetch(`/api/cidades?q=${encodeURIComponent(texto)}`);
    if (!res.ok) {
        const { erro } = await res.json();
        throw new Error(erro || 'Erro ao buscar sugestões');
    }
    return res.json();
}

export async function buscarCidadePorCoordenadas(lat, lon) {
    const res = await fetch(`/api/cidade-por-coords?lat=${lat}&lon=${lon}`);
    if (!res.ok) {
        const { erro } = await res.json();
        throw new Error(erro || 'Cidade não encontrada para as coordenadas informadas');
    }
    return res.json();
}