import { Router, RequestHandler } from 'express';
import { login } from '../controllers/authController';

const router = Router();

router.post('/login', login as RequestHandler);

export default router;
