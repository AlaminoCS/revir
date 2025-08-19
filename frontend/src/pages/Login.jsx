import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Container
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const url = 'VITE_API_BASE=https://backrevir.vercel.app' // 'http://localhost:4000'

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    axios.post(`${url}/auth/login`, { email, password })
      .then(res => {
        const token = res.data && res.data.token;
        if (token) {
          login(token);
        }
        navigate('/home');
      })
      .catch(err => {
        console.error(err);
        alert('Credenciais inválidas');
      });
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: {
        xs: '#f5f6fa',
        md: `linear-gradient(120deg, #f5f6fa 0%, #e0e7ff 100%)`
      },
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <img
          src={'https://pixc.com/wp-content/uploads/2020/11/clothing-photography-featured-image.png'}
          alt="Login background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7) blur(2px)',
          }}
        />
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(120deg, rgba(2,6,23,0.24), rgba(2,6,23,0.36))',
        }} />
      </Box>
      <Container maxWidth="sm" sx={{ zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={6} sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 5,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          backdropFilter: 'blur(4px)',
          background: 'rgba(255,255,255,0.85)',
          minWidth: { xs: '90vw', md: 400 },
          maxWidth: 420,
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#3b3b3b', mb: 2 }}>
            Bem-vindo!
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Faça login para acessar o sistema
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              sx={{ borderRadius: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword(s => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <FormControlLabel control={<Checkbox />} label="Lembrar-me" />
              <Button variant="text" sx={{ textTransform: 'none' }} onClick={e => e.preventDefault()}>
                Esqueceu a senha?
              </Button>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5, fontWeight: 600, fontSize: '1rem', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              Entrar
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2, py: 1.5, borderRadius: 3, color: '#3b3b3b', borderColor: '#e0e7ff' }}
              onClick={() => { setEmail(''); setPassword(''); }}
            >
              Limpar
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 4 }}>
            © 2025 Revir. Todos os direitos reservados.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
