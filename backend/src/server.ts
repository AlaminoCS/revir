import app from './app';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

config();

// Configuração do Supabase com verificação
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis do Supabase não configuradas!');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Dica: Crie um arquivo .env na raiz com:');
    console.log('SUPABASE_URL="sua-url"');
    console.log('SUPABASE_KEY="sua-chave"');
  }
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: { persistSession: false }
});

// Adicione esta rota de teste antes do export
app.get('/api/test-supabase', async (req: Request, res: Response) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Variáveis do Supabase não configuradas',
        config: {
          supabaseUrl: supabaseUrl ? '✅' : '❌',
          supabaseKey: supabaseKey ? '✅' : '❌'
        }
      });
    }

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.json({
      status: 'Conexão com Supabase OK!',
      firstSale: data.length > 0 ? data[0] : 'Nenhuma venda encontrada',
      env: {
        nodeEnv: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION
      }
    });
  } catch (error: unknown) {
    console.error('Erro no teste Supabase:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ 
      error: 'Falha na conexão com Supabase',
      details: errorMessage 
    });
  }
});

// Exportação para Vercel (mantenha como última linha)
export default app;

// Rodar localmente
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Teste Supabase: http://localhost:${PORT}/api/test-supabase`);
  });
}