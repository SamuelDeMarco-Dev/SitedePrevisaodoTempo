import { Router } from 'express';
import { getCidades, getCidadePorCoordenadas } from '../Controllers/geocodingController.js';

const router = Router();

router.get('/cidades', getCidades);
router.get('/cidade-por-coords', getCidadePorCoordenadas);

export default router;