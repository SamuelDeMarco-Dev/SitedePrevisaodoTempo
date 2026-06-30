import { getGeocoding, getCidadePorCoordenadas as getCidadeService } from '../Services/geocoding.js';

export async function getCidades(req, res) {
    const { q } = req.query;
    try {
        const cidades = await getGeocoding(q);
        res.json(cidades);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
}

export async function getCidadePorCoordenadas(req, res) {
    const { lat, lon } = req.query;
    try {
        const cidade = await getCidadeService(lat, lon);
        res.json(cidade);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
}