import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import climaRoutes from './Routes/climaRoutes.js';
import geocodingRoutes from './Routes/geocodingRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api', climaRoutes);
app.use('/api', geocodingRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
