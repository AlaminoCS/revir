import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  { auth: { persistSession: false } }
);

// CREATE
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

// READ TODOS
export const getClientes = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
  }
};

// READ POR ID
export const getClienteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(404).json({ error: 'Cliente não encontrado', details: error.message });
  }
};

// UPDATE
export const updateCliente = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, telefone, data_nascimento } = req.body;
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({ nome, telefone, data_nascimento })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json({ message: 'Cliente atualizado', cliente: data[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar cliente', details: error.message });
  }
};

// DELETE
export const deleteCliente = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao deletar cliente', details: error.message });
  }
};
