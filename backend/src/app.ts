import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import salesRoutes from './routes/salesRoutes';



const app = express();

// Middlewares
app.use(cors({
  origin: [
    'https://frontend-six-mu-33.vercel.app',
    'http://localhost:4200'
  ]
}));
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', salesRoutes); 

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

export default app;