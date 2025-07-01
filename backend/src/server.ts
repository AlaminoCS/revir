import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import express, { Request, Response } from 'express';
import { createServer } from 'http';

import app from './app';

// Supabase config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase config faltando!');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Crie um .env com SUPABASE_URL e SUPABASE_KEY');
  }
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: { persistSession: false },
});

// Teste de conexão com Supabase
app.get('/api/test-supabase', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.json({
      status: '✅ Conexão OK!',
      firstSale: data.length > 0 ? data[0] : 'Nenhuma venda encontrada',
      env: {
        nodeEnv: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: '❌ Erro na conexão com Supabase',
      details: error?.message || 'Erro desconhecido',
    });
  }
});

// ⚙️ LOCAL: roda com listen()
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local rodando em http://localhost:${PORT}`);
    console.log(`🧪 Teste Supabase: http://localhost:${PORT}/api/test-supabase`);
  });
}

// 🚀 VERCEL: exporta como handler compatível
const server = createServer(app);
export default (req: any, res: any) => {
  server.emit('request', req, res);
};
