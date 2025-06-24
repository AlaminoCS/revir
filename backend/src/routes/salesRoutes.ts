import { Router, RequestHandler } from 'express';
import { registerSale, getSales } from '../controllers/salesController';

const router = Router();

router.post('/sales', registerSale as RequestHandler);
router.get('/sales', getSales as RequestHandler);

export default router;