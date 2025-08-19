import React from 'react'
import { Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export function NotFound(){
  const nav = useNavigate()
  return (
    <Container sx={{ textAlign: 'center', mt: 6 }}>
      <Typography variant="h3" gutterBottom>404 — Página não encontrada</Typography>
      <Typography sx={{ mb: 3 }}>A página que você procura não existe.</Typography>
      <Button variant="contained" onClick={() => nav('/home')}>Ir para o Início</Button>
    </Container>
  )
}
