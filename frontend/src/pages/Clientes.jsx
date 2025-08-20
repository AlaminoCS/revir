import React, { useEffect, useMemo, useState } from 'react'
import {
  Container, Typography, Box, Button, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Chip, useTheme, TableContainer, Stack, InputAdornment, Badge
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import { formatCPF, unformatCPF, isValidCPF, formatPhone, MAX_LENGTH_CPF, MAX_LENGTH_PHONE } from '../utils/validators'
import axios from 'axios'

const STORAGE_KEY = 'revir_clients'

function emptyClient() {
  return { id: null, name: '', phone: '', dob: '', cpf: '' }
}

export function Clientes() {
  const [clients, setClients] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyClient())
  const [search, setSearch] = useState('')
  const theme = useTheme()

  useEffect(() => {
    let mounted = true
    const url = 'https://backrevir.vercel.app' // 'http://localhost:4000'
    const token = window.localStorage.getItem('revir_token')
    axios.get(`${url}/clients`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(r => { if (!mounted) return; if (r.data && r.data.items) setClients(r.data.items) })
      .catch(() => {
        try { const raw = localStorage.getItem(STORAGE_KEY); if (raw && mounted) setClients(JSON.parse(raw)) } catch (e) { console.error(e) }
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clients)) } catch (e) { console.error(e) } }, [clients])

  const filteredClients = useMemo(() => {
    const searchTerm = search.toLowerCase()
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      c.phone.includes(searchTerm) ||
      c.cpf.includes(searchTerm)
    ).reverse()
  }, [clients, search])

  const openNew = () => { setEditing(null); setForm(emptyClient()); setOpen(true) }

  const openEdit = (c) => { setEditing(c.id); setForm({ ...c, cpf: formatCPF(c.cpf) }); setOpen(true) }

  const handleClose = () => { setOpen(false); setForm(emptyClient()); setEditing(null) }

  const handleDelete = (id) => {
    if (!confirm('Excluir este cliente?')) return
    const token = window.localStorage.getItem('revir_token')
    axios.delete(`${url}/clients/${id}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(() => setClients(s => s.filter(c => c.id !== id)))
      .catch(() => setClients(s => s.filter(c => c.id !== id)))
  }

  const handleChange = (k, v) => {
    if (k === 'cpf') v = formatCPF(v)
    if (k === 'phone') v = formatPhone(v)
    setForm(f => ({ ...f, [k]: v }))
  }

  const handleSave = () => {
    const cpfRaw = unformatCPF(form.cpf)
    if (!form.name.trim()) return alert('Nome é obrigatório')
    if (!isValidCPF(cpfRaw)) return alert('CPF inválido')
    if (!form.dob) return alert('Data de nascimento é obrigatória')

    const payload = { name: form.name, phone: form.phone, dob: form.dob, cpf: cpfRaw }
    const token = window.localStorage.getItem('revir_token')
    if (editing) {
      axios.put(`${url}/clients/${editing}`, payload, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        .then(r => setClients(s => s.map(c => c.id === editing ? r.data.item : c)))
        .catch(() => setClients(s => s.map(c => c.id === editing ? { ...c, ...payload, id: editing } : c)))
    } else {
      axios.post(`${url}/clients`, payload, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        .then(r => setClients(s => [...s, r.data.item]))
        .catch(() => { const id = Date.now(); setClients(s => [...s, { id, ...payload }]) })
    }
    handleClose()
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            👥 Cadastro de Clientes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie o cadastro de clientes da sua loja
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar clientes..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="contained" 
            onClick={openNew}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>

      {/* Clients Table */}
      <Paper sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme.shadows[1]
      }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contato</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nascimento</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CPF</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                          <PersonIcon sx={{ color: theme.palette.primary.dark }} />
                        </Avatar>
                        <Typography fontWeight="500">{client.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="action" fontSize="small" />
                        <Typography>{client.phone || 'Não informado'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CakeIcon color="action" fontSize="small" />
                        <Typography>{client.dob || 'Não informado'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatCPF(client.cpf)} 
                        size="small" 
                        icon={<AssignmentIcon fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => openEdit(client)}
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.light'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(client.id)}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Client Form Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {editing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nome Completo"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              label="Telefone"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              fullWidth
              variant="outlined"
              inputProps={{ maxLength: MAX_LENGTH_PHONE }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              label="Data de Nascimento"
              type="date"
              value={form.dob}
              onChange={e => handleChange('dob', e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              label="CPF"
              value={form.cpf}
              onChange={e => handleChange('cpf', e.target.value)}
              fullWidth
              variant="outlined"
              inputProps={{ maxLength: MAX_LENGTH_CPF }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            {editing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}