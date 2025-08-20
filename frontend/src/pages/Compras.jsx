import React, { useEffect, useMemo, useState } from 'react'
import {
  Container, Typography, Box, Button, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Chip, useTheme, TableContainer, Stack, InputAdornment, Badge, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ShoppingCart as ShoppingCartIcon,
  SwapHoriz as SwapHorizIcon,
  LocalShipping as LocalShippingIcon,
  Search as SearchIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material'
import axios from 'axios'

const STORAGE_KEY = 'revir_purchases'

function emptyPurchase() {
  return { id: null, supplierId: '', type: 'venda', qty: 1, value: 0 }
}

function normalizePurchase(p) {
  if (!p) return p
  return {
    id: p.id,
    supplierId: p.supplier_id || p.supplierId || p.supplier || null,
    type: p.type || 'venda',
    qty: p.qty || 0,
    value: Number(p.value || p.valor || 0),
    notes: p.notes || p.note || null,
    createdAt: p.created_at || p.createdAt || null,
  }
}

export function Compras() {
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyPurchase())
  const [search, setSearch] = useState('')
  const theme = useTheme()
  const url = 'https://backrevir.vercel.app' // 'http://localhost:4000'

  useEffect(() => {
    let mounted = true
    const token = window.localStorage.getItem('revir_token')
    
    const fetchData = async () => {
      try {
        const [purchasesRes, suppliersRes] = await Promise.all([
          axios.get(`${url}/purchases`, { headers: { Authorization: token ? `Bearer ${token}` : '' } }),
          axios.get(`${url}/suppliers`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        ])
        
        if (mounted) {
          if (purchasesRes.data?.items) {
            const norm = (purchasesRes.data.items || []).map(normalizePurchase)
            setItems(norm)
          }
          if (suppliersRes.data?.items) setSuppliers(suppliersRes.data.items)
        }
      } catch (error) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw && mounted) setItems(JSON.parse(raw))
        } catch(e) { 
          console.error(e) 
        }
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [])

  useEffect(() => { 
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } 
    catch (e) { console.error(e) } 
  }, [items])

  const filteredItems = useMemo(() => {
    const searchTerm = search.toLowerCase()
    return items.filter(item => {
      const supplier = suppliers.find(s => s.id === item.supplierId) || {}
      return (
        supplier.name?.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        String(item.value).includes(searchTerm) ||
        String(item.qty).includes(searchTerm))
    }).reverse()
  }, [items, suppliers, search])

  const openNew = () => { setEditing(null); setForm(emptyPurchase()); setOpen(true) }
  const openEdit = (it) => { setEditing(it.id); setForm({ ...it }); setOpen(true) }
  const handleClose = () => { setOpen(false); setForm(emptyPurchase()); setEditing(null) }

  const handleDelete = (id) => {
    if (!confirm('Excluir esta compra?')) return
    const token = window.localStorage.getItem('revir_token')
    axios.delete(`${url}/purchases/${id}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(() => setItems(s => s.filter(i => i.id !== id)))
      .catch(() => setItems(s => s.filter(i => i.id !== id)))
  }

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.supplierId) return alert('Fornecedor é obrigatório')
    if (!form.qty || form.qty <= 0) return alert('Quantidade deve ser maior que zero')
    if (!form.value || Number(form.value) <= 0) return alert('Valor deve ser maior que zero')

    const payload = { 
      supplierId: form.supplierId, 
      type: form.type, 
      qty: Number(form.qty), 
      value: Number(form.value) 
    }
    
    const token = window.localStorage.getItem('revir_token')
    if (editing) {
      axios.put(`${url}/purchases/${editing}`, payload, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
  .then(r => setItems(s => s.map(i => i.id === editing ? normalizePurchase(r.data.item) : i)))
  .catch(() => setItems(s => s.map(i => i.id === editing ? { ...i, ...payload, id: editing } : i)))
    } else {
      axios.post(`${url}/purchases`, payload, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
  .then(r => setItems(s => [...s, normalizePurchase(r.data.item)]))
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
            🛒 Controle de Compras
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registre todas as compras e trocas com fornecedores
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar compras..."
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
            startIcon={<ShoppingCartIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Nova Compra
          </Button>
        </Box>
      </Box>

      {/* Purchases Table */}
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
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quantidade</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const supplier = suppliers.find(s => s.id === item.supplierId) || {}
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                            <LocalShippingIcon sx={{ color: theme.palette.primary.dark }} />
                          </Avatar>
                          <Typography fontWeight="500">{supplier.name || '—'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type === 'venda' ? 'Compra' : 'Troca'}
                          color={item.type === 'venda' ? 'primary' : 'secondary'}
                          icon={item.type === 'venda' ? <ShoppingCartIcon fontSize="small" /> : <SwapHorizIcon fontSize="small" />}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>{item.qty} peça{item.qty !== 1 ? 's' : ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon color="action" fontSize="small" />
                          <Typography fontWeight="500">
                            {Number(item.value).toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon color="action" fontSize="small" />
                          <Typography>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
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
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {search ? 'Nenhuma compra encontrada' : 'Nenhuma compra registrada'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Purchase Form Dialog */}
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
          {editing ? 'Editar Compra' : 'Registrar Nova Compra'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Fornecedor</InputLabel>
              <Select 
                value={form.supplierId}
                onChange={e => handleChange('supplierId', e.target.value)}
                label="Fornecedor"
                sx={{ borderRadius: 2 }}
              >
                {suppliers.map(s => (
                  <MenuItem key={s.id} value={s.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShippingIcon fontSize="small" color="action" />
                      {s.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select 
                value={form.type}
                onChange={e => handleChange('type', e.target.value)}
                label="Tipo"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="venda">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon fontSize="small" color="action" />
                    Compra
                  </Box>
                </MenuItem>
                <MenuItem value="troca">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHorizIcon fontSize="small" color="action" />
                    Troca
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Quantidade de peças" 
              type="number" 
              value={form.qty} 
              onChange={e => handleChange('qty', e.target.value)} 
              fullWidth
              InputProps={{
                sx: { borderRadius: 2 },
                inputProps: { min: 1 }
              }}
            />

            <TextField 
              label="Valor (R$)" 
              type="number" 
              value={form.value} 
              onChange={e => handleChange('value', e.target.value)} 
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
                inputProps: { min: 0, step: 0.01 }
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
            {editing ? 'Salvar Alterações' : 'Registrar Compra'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}