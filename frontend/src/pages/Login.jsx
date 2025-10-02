import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/constants'
import { Box, Grid, Paper, Typography, TextField, Button, IconButton, InputAdornment, FormControlLabel, Checkbox, Container } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return

    axios.post(`${API_BASE_URL}/auth/login`, { email, password })
      .then(res => {
        const token = res.data && res.data.token
        if (token) {
          login(token)
        }
        navigate('/home')
      })
      .catch(err => {
        console.error(err)
        alert('Credenciais inválidas')
      })
  }

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid container component="main" sx={{ boxShadow: 'none' }}>
        <Grid item xs={12} md={5}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, m: { xs: 2, md: 4 }, width: '100%' }} aria-labelledby="login-title">
              <Typography id="login-title" variant="h4" component="h1" gutterBottom>SeedProd Login</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Don't have an account? <a href="#" onClick={e => e.preventDefault()}>Get SeedProd Now</a></Typography>

              <Box component="form" onSubmit={handleSubmit} aria-describedby="login-desc">
                <div id="login-desc" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Formulário de login com campos de email e senha</div>

                <TextField label="Email Address" type="email" fullWidth value={email} onChange={e => setEmail(e.target.value)} required margin="normal" />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'} onClick={() => setShowPassword(s => !s)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <FormControlLabel control={<Checkbox />} label="Remember Me" />
                  <Button variant="text" onClick={e => e.preventDefault()}>Forgot Your Password?</Button>
                </Box>

                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Log In</Button>

                <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={() => { setEmail(''); setPassword('') }}>Clear</Button>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>Copyright © 2019 SeedProd, LLC. SeedProd™ is a trademark of SeedProd, LLC.</Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>

        <Grid item xs={12} md={7} sx={{ display: { xs: 'none', md: 'block' } }} aria-hidden>
          <Box sx={{ height: '100%', minHeight: 520, backgroundImage: `url('/default-clothing.svg')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'linear-gradient(180deg, rgba(2,6,23,0.24), rgba(2,6,23,0.36))' }} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
