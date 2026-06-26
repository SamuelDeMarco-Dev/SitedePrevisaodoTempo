import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPrevisaoTempo } from './Services/buscaPrevisao.js';
import { getPrevisaoTempo5dias } from './Services/buscaPrevisao5dias.js';
import { getGeocoding, getCidadePorCoordenadas } from './Services/geocoding.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/clima', async (req, res) => {
    const { cidade } = req.query;
    try {
        const dados = await getPrevisaoTempo(cidade);
        res.json(dados);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

app.get('/api/previsao5dias', async (req, res) => {
    const { cidade } = req.query;
    try {
        const dados = await getPrevisaoTempo5dias(cidade);
        res.json(dados);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

app.get('/api/cidades', async (req, res) => {
    const { q } = req.query;
    try {
        const cidades = await getGeocoding(q);
        res.json(cidades);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

app.get('/api/cidade-por-coords', async (req, res) => {
    const { lat, lon } = req.query;
    try {
        const cidade = await getCidadePorCoordenadas(lat, lon);
        res.json(cidade);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
