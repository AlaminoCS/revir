import { Request, Response } from 'express';

// Dados mockados do usuário
const MOCK_USER = {
  username: 'cleide',
  password: 'revir321$',
  name: 'Cleide'
};

export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    return;
  }

  if (username === MOCK_USER.username && password === MOCK_USER.password) {
    const mockToken = Buffer.from(`${username}:${password}`).toString('base64');
    res.status(200).json({
      token: mockToken,
      user: {
        name: MOCK_USER.name,
        username: MOCK_USER.username
      }
    });
    return;
  }

  res.status(401).json({ message: 'Usuário ou senha inválidos' });
};