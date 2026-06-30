import { Router } from 'express';
import { getClima } from '../Controllers/climaController.js';

const router = Router();

router.get('/clima', getClima);
router.get('/previsao5dias', getPrevisao5dias);

export default router;