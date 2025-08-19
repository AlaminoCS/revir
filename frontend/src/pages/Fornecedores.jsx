import React, { useEffect, useMemo, useState } from 'react'
import {
  Container, Typography, Box, Button, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Chip, useTheme, TableContainer, Stack, InputAdornment, Badge, Switch,
  FormControlLabel, Tooltip
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Badge as BadgeIcon
} from '@mui/icons-material'
import { formatCPF, unformatCPF, isValidCPF, formatCNPJ, unformatCNPJ, isValidCNPJ, formatPhone, MAX_LENGTH_CPF, MAX_LENGTH_CNPJ, MAX_LENGTH_PHONE } from '../utils/validators'
import axios from 'axios'

const STORAGE_KEY = 'revir_suppliers'

function emptySupplier() {
  return { id: null, name: '', isCNPJ: false, doc: '', phone: '', email: '' }
}

export function Fornecedores() {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptySupplier())
  const [search, setSearch] = useState('')
  const theme = useTheme()

  useEffect(() => {
    let mounted = true
    const token = window.localStorage.getItem('revir_token')
    axios.get('http://localhost:4000/suppliers', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(r => { if (!mounted) return; if (r.data && r.data.items) setItems(r.data.items) })
      .catch(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw && mounted) setItems(JSON.parse(raw)) } catch (e) { console.error(e) } })
    return () => { mounted = false }
  }, [])

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch (e) { console.error(e) } }, [items])

  const filteredItems = useMemo(() => {
    const searchTerm = search.toLowerCase()
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.doc.includes(searchTerm.replace(/\D/g, '')) ||
      item.phone.includes(searchTerm.replace(/\D/g, '')) ||
      item.email.toLowerCase().includes(searchTerm)
    ).reverse()
  }, [items, search])

  const openNew = () => { setEditing(null); setForm(emptySupplier()); setOpen(true) }

  const openEdit = (it) => {
    setEditing(it.id)
    setForm({ ...it, doc: it.doc || '' })
    setOpen(true)
  }

  const handleClose = () => { setOpen(false); setForm(emptySupplier()); setEditing(null) }

  const handleDelete = (id) => {
    if (!confirm('Excluir este fornecedor?')) return
    const token = window.localStorage.getItem('revir_token')
    axios.delete(`http://localhost:4000/suppliers/${id}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(() => setItems(s => s.filter(i => i.id !== id)))
      .catch(() => setItems(s => s.filter(i => i.id !== id)))
  }

  const handleChange = (k, v) => {
    if (k === 'doc') {
      if (form.isCNPJ) v = formatCNPJ(v)
      else v = formatCPF(v)
    }
    if (k === 'phone') v = formatPhone(v)
    setForm(f => ({ ...f, [k]: v }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return alert('Nome obrigatório')
    const rawDoc = form.isCNPJ ? unformatCNPJ(form.doc) : unformatCPF(form.doc)
    if (form.isCNPJ) {
      if (!isValidCNPJ(rawDoc)) return alert('CNPJ inválido')
    } else {
      if (!isValidCPF(rawDoc)) return alert('CPF inválido')
    }
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return alert('E-mail inválido')

    const payload = { name: form.name, isCNPJ: form.isCNPJ, doc: rawDoc, phone: form.phone, email: form.email }
    const token = window.localStorage.getItem('revir_token')
    if (editing) {
      axios.put(`http://localhost:4000/suppliers/${editing}`, payload, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        .then(r => setItems(s => s.map(it => it.id === editing ? r.data.item : it)))
        .catch(() => setItems(s => s.map(it => it.id === editing ? { ...it, ...payload, id: editing } : it)))
    } else {
      axios.post('http://localhost:4000/suppliers', payload, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        .then(r => setItems(s => [...s, r.data.item]))
        .catch(() => { const id = Date.now(); setItems(s => [...s, { id, ...payload }]) })
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
            🏭 Cadastro de Fornecedores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus fornecedores e parceiros comerciais
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar fornecedores..."
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
            startIcon={<BusinessIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Novo Fornecedor
          </Button>
        </Box>
      </Box>

      {/* Suppliers Table */}
      <Paper sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme.shadows[1]
      }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Fornecedor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Documento</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contato</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>E-mail</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                          {item.isCNPJ ? <BusinessIcon sx={{ color: theme.palette.primary.dark }} /> : <PersonIcon sx={{ color: theme.palette.primary.dark }} />}
                        </Avatar>
                        <Typography fontWeight="500">{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.isCNPJ ? formatCNPJ(item.doc) : formatCPF(item.doc)}
                        color={item.isCNPJ ? 'primary' : 'secondary'}
                        icon={item.isCNPJ ? <AssignmentIcon fontSize="small" /> : <BadgeIcon fontSize="small" />}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="action" fontSize="small" />
                        <Typography>{item.phone || 'Não informado'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="action" fontSize="small" />
                        <Typography sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 200
                        }}>
                          {item.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton 
                          onClick={() => openEdit(item)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.light'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          onClick={() => handleDelete(item.id)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.light'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Supplier Form Dialog */}
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
          {editing ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nome do Fornecedor"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                Tipo de Documento:
              </Typography>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={form.isCNPJ}
                    onChange={e => setForm(f => ({ ...f, isCNPJ: e.target.checked, doc: '' }))}
                    color="primary"
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {form.isCNPJ ? (
                      <>
                        <BusinessIcon fontSize="small" />
                        <span>CNPJ</span>
                      </>
                    ) : (
                      <>
                        <PersonIcon fontSize="small" />
                        <span>CPF</span>
                      </>
                    )}
                  </Box>
                }
              />
            </Box>

            <TextField
              label={form.isCNPJ ? 'CNPJ' : 'CPF'}
              value={form.doc}
              onChange={e => handleChange('doc', e.target.value)}
              fullWidth
              variant="outlined"
              inputProps={{ maxLength: form.isCNPJ ? MAX_LENGTH_CNPJ : MAX_LENGTH_CPF }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {form.isCNPJ ? <AssignmentIcon color="action" /> : <BadgeIcon color="action" />}
                  </InputAdornment>
                ),
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
              label="E-mail"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
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
            {editing ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}