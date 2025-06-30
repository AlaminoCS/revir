import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (adicione essas variáveis no seu .env)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

console.log('Supabase URL:', process.env.SUPABASE_URL?.slice(0, 10) + '...');

export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    // Busca todas as vendas no Supabase, ordenadas pela mais recente
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(sales || []); // Retorna um array vazio se não houver dados
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: 'Erro interno ao carregar vendas' });
  }
};

// Mantemos o registerSale temporariamente como está (usando o JSON local)
export const registerSale = (req: Request, res: Response): void => {
  // ... (código original)
};