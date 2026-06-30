import { getPrevisaoTempo } from './Services/buscaPrevisao.js';

export async function getClima(req, res) {
    const {cidade} = req.query;
    try{
        const dados = await getPrevisaoTempo(cidade);
        res.json(dados);
    } catch (erro){
        res.status(400).json({erro: erro.message});
    }
}