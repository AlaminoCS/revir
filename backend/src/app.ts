import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import salesRoutes from './routes/salesRoutes';
import clientesRoutes from './routes/clientesRoutes';

const app = express();


const corsOptions = {
  origin: [
    'https://frontend-six-mu-33.vercel.app', // Seu frontend na Vercel
    'http://localhost:4200'                  // Ambiente de desenvolvimento
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Adicione OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Adicione headers necessários
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Middleware para headers adicionais
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});

app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', salesRoutes); 
app.use('/api', clientesRoutes); 

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});


export default app;