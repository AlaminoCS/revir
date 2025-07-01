import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import salesRoutes from './routes/salesRoutes';

const app = express();

// Configuração robusta de CORS
const allowedOrigins = [
  'https://frontend-six-mu-33.vercel.app',
  'http://localhost:4200'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Para navegadores antigos
};

app.use(cors(corsOptions));

// Middleware para pré-flight requests
app.options('*', cors(corsOptions));

// Middleware para headers consistentes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', salesRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

export default app;