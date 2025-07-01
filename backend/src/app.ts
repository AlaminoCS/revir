import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import salesRoutes from './routes/salesRoutes';



const app = express();


// Configuração detalhada do CORS
const corsOptions = {
  origin: [
    'https://frontend-six-mu-33.vercel.app', // Seu frontend na Vercel
    'http://localhost:4200'                  // Ambiente de desenvolvimento
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware para headers adicionais
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', salesRoutes); 

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

export default app;