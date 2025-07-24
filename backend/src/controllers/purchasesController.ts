
import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  { auth: { persistSession: false } }
);

const TABELA = 'purchases';

// CREATE
export const createPurchase = async (req: Request, res: Response) => {
  const { fornecedor_id, tipo, quantidade, valor } = req.body;
  if (!fornecedor_id || !tipo || !quantidade || valor === undefined) {
    return res.status(400).json({ error: 'fornecedor_id, tipo, quantidade e valor são obrigatórios' });
  }
  try {
    const { data, error } = await supabase
      .from(TABELA)
      .insert([{ fornecedor_id, tipo, quantidade, valor }])
      .select();
    if (error) throw error;
    res.status(201).json({ message: 'Compra cadastrada com sucesso', purchase: data[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar compra', details: error.message });
  }
};

// READ ALL
export const listPurchases = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from(TABELA).select();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar compras', details: error.message });
  }
};

// READ BY ID
export const getPurchaseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from(TABELA).select().eq('id', id).single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(404).json({ error: 'Compra não encontrada', details: error.message });
  }
};

// UPDATE
export const updatePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fornecedor_id, tipo, quantidade, valor } = req.body;
  try {
    const { data, error } = await supabase
      .from(TABELA)
      .update({ fornecedor_id, tipo, quantidade, valor })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json({ message: 'Compra atualizada', purchase: data[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar compra', details: error.message });
  }
};

// DELETE
export const deletePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from(TABELA).delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Compra deletada com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao deletar compra', details: error.message });
  }
};
