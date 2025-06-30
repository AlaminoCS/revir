import app from './app';
import { config } from 'dotenv';

config();

// A Vercel usa process.env.PORT automaticamente
const PORT = process.env.PORT || 3001;

// Exporte o app para a Vercel
export default app;

// Rodar localmente
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}