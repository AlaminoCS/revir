import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

export default app;