import { Router } from 'express';
import { listPurchases, createPurchase, getPurchaseById, updatePurchase, deletePurchase } from '../controllers/purchasesController';

const router = Router();

router.get('/purchases', listPurchases);
router.post('/purchases', createPurchase);
router.get('/purchases/:id', getPurchaseById);
router.put('/purchases/:id', updatePurchase);
router.delete('/purchases/:id', deletePurchase);

export default router;
