import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// Tipos para melhor organização
type Product = {
  name: string;
  price: number;
  quantity?: number;
};

type Sale = {
  products: Product[];
  total: number;
  created_at?: string;
};

// Configuração do Supabase (adicione essas variáveis no seu .env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not configured!');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false } // Importante para serverless
});

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

export const registerSale = async (req: Request, res: Response): Promise<void> => {
  const { products, total } = req.body as Sale;

  // Validação dos dados
  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400).json({ 
      message: 'Lista de produtos inválida',
      details: 'O campo "products" deve ser um array não vazio'
    });
    return;
  }

  if (typeof total !== 'number' || total <= 0) {
    res.status(400).json({
      message: 'Total inválido',
      details: 'O campo "total" deve ser um número positivo'
    });
    return;
  }

  try {
    // Inserção no Supabase
    const { data, error } = await supabase
      .from('sales')
      .insert([{
        products,
        total,
        created_at: new Date().toISOString()
      }])
      .select(); // Retorna o registro inserido

    if (error) {
      console.error('Erro no Supabase:', error);
      throw error;
    }

    // Sucesso - retorna o registro criado
    res.status(201).json({
      message: 'Venda registrada com sucesso',
      sale: data[0]
    });

  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({
      message: 'Erro interno ao registrar venda',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};