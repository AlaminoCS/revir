import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  { auth: { persistSession: false } }
);

export const createCliente = async (req: Request, res: Response) => {
  const { nome, telefone, data_nascimento } = req.body;

  // Validação básica
  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ 
        nome, 
        telefone, 
        data_nascimento: data_nascimento || null 
      }])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso',
      cliente: data[0]
    });
    } catch (error: unknown) {
    console.error('Erro ao cadastrar cliente:', error);

    if (error instanceof Error) {
      // Se for um objeto Error, tem message
      res.status(500).json({ 
        error: 'Erro interno no servidor',
        details: error.message
      });
    } else {
      // Se não for Error, manda uma mensagem genérica ou converte para string
      res.status(500).json({ 
        error: 'Erro interno no servidor',
        details: String(error)
      });
    }
  }
 
};

export const getClientes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false }); // ordena do mais novo pro mais antigo

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Erro ao buscar clientes:', error);

    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Erro interno no servidor',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Erro interno no servidor',
        details: String(error) 
      });
    }
  }
};
