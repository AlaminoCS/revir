import { Router } from 'express';
import { createCliente, getClientes } from '../controllers/clientesController';

const router = Router();

router.post('/clientes', createCliente);
router.get('/clientes', getClientes);

export default router;