import { Router } from 'express';
import { getCidades } from '../Controllers/geocodingController.js';
import { getCidadePorCoordenadas } from '../Controllers/geocodingController.js';

const router = Router();

router.get('/cidades', getCidades);
router.get('/cidadeCoordenadas', getCidadePorCoordenadas);

export default router;