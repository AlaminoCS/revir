import { Request, Response } from 'express';

// Armazenamento temporário em memória
const salesList: any[] = [];

export const registerSale = (req: Request, res: Response): void => {
  const { products, total } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400).json({ message: 'Produtos são obrigatórios' });
    return;
  }

  const sale = {
    id: salesList.length + 1,
    products,
    total,
    date: new Date().toISOString()
  };

  salesList.push(sale);

  res.status(201).json({
    message: 'Venda registrada com sucesso!',
    sale
  });
};

export const getSales = (req: Request, res: Response): void => {
  res.status(200).json(salesList);
};