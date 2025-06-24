import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../data/db.json');

// Função auxiliar para ler o DB
function readDB(): any[] {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

// Função auxiliar para escrever no DB
function writeDB(data: any[]) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export const registerSale = (req: Request, res: Response): void => {
  const { products, total } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400).json({ message: 'Produtos são obrigatórios' });
    return;
  }

  const salesList = readDB();

  const newSale = {
    id: salesList.length + 1,
    products,
    total,
    date: new Date().toISOString()
  };

  writeDB([...salesList, newSale]);

  res.status(201).json(newSale);
};

export const getSales = (req: Request, res: Response): void => {
  const sales = readDB();
  res.status(200).json(sales);
};