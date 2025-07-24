import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  { auth: { persistSession: false } }
)

const TABELA = 'fornecedores'

// ✅ CREATE
export const createFornecedor = async (req: Request, res: Response) => {
  const { documento, nome, telefone } = req.body

  if (!documento || !nome) {
    return res.status(400).json({ error: 'documento e nome são obrigatórios' })
  }

  try {
    const { data, error } = await supabase
      .from(TABELA)
      .insert([{ documento, nome, telefone }])
      .select()

    if (error) throw error

    res.status(201).json({ message: 'Fornecedor cadastrado com sucesso', fornecedor: data[0] })
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cadastrar fornecedor', details: error.message })
  }
}

// ✅ READ TODOS
export const listFornecedores = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from(TABELA).select()

    if (error) throw error

    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar fornecedores', details: error.message })
  }
}

// ✅ READ POR ID
export const getFornecedorById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const { data, error } = await supabase.from(TABELA).select().eq('id', id).single()

    if (error) throw error

    res.json(data)
  } catch (error: any) {
    res.status(404).json({ error: 'Fornecedor não encontrado', details: error.message })
  }
}

// ✅ UPDATE
export const updateFornecedor = async (req: Request, res: Response) => {
  const { id } = req.params
  const { documento, nome, telefone } = req.body

  try {
    const { data, error } = await supabase
      .from(TABELA)
      .update({ documento, nome, telefone })
      .eq('id', id)
      .select()

    if (error) throw error

    res.json({ message: 'Fornecedor atualizado', fornecedor: data[0] })
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar fornecedor', details: error.message })
  }
}

// ✅ DELETE
export const deleteFornecedor = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const { error } = await supabase.from(TABELA).delete().eq('id', id)

    if (error) throw error

    res.json({ message: 'Fornecedor deletado com sucesso' })
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao deletar fornecedor', details: error.message })
  }
}
