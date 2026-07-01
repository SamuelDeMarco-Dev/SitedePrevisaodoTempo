import { getPrevisaoTempo } from '../Services/buscaPrevisao.js';
import { getPrevisaoTempo5dias as getPrevisao5diasService } from '../Services/buscaPrevisao5dias.js';
import { Clima } from '../Models/Clima.js';

export async function getClima(req, res) {
    const { cidade } = req.query;
    try {
        const dados = await getPrevisaoTempo(cidade);
        res.json(new Clima(dados));
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
}

export async function getPrevisao5dias(req, res) {
    const { cidade } = req.query;
    try {
        const dados = await getPrevisao5diasService(cidade);
        res.json(dados);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
}