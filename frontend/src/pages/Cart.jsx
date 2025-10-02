import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Container, Grid, Paper, Typography, TextField, IconButton, Button, Select, 
  MenuItem, Box, Divider, InputAdornment, Avatar, Badge, Chip, Stack, useTheme
} from '@mui/material'
import { 
  Delete as DeleteIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  formatCPF, isValidCPF, MAX_LENGTH_CPF,
  formatPhone, isValidPhone, MAX_LENGTH_PHONE
} from '../utils/validators'
import { ReceiptModal } from '../components/receipt-modal/'
import { useCart } from '../context/CartContext'
import { API_BASE_URL } from '../utils/constants'

export function Cart() {
  const {
    items,
    updateQty,
    removeItem,
    clearCart,
    cpf,
    setCpf,
    clientId,
    setClientId,
    paymentMethod,
    setPaymentMethod,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    clientInfoType,
    setClientInfoType,
    clientInfoValue,
    setClientInfoValue,
    subtotal,
    total,
    checkout
  } = useCart()

  const [localCpf, setLocalCpf] = useState(cpf || '')
  const [localClientInfoType, setLocalClientInfoType] = useState(clientInfoType || '')
  const [localClientInfoValue, setLocalClientInfoValue] = useState(clientInfoValue || '')
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [clientAlert, setClientAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [productsData, setProductsData] = useState({})
  const theme = useTheme()

  // Buscar informações completas dos produtos incluindo imagens
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const token = window.localStorage.getItem('revir_token')
        const productIds = items.map(item => item.id)
        
        if (productIds.length > 0) {
          const responses = await Promise.all(
            productIds.map(id => 
              axios.get(`${API_BASE_URL}/products/${id}`, {
                headers: { Authorization: token ? `Bearer ${token}` : '' }
              })
            )
          )
          
          const data = {}
          responses.forEach((res, index) => {
            if (res.data?.item) {
              data[productIds[index]] = {
                images: res.data.item.images || [],
                description: res.data.item.description || ''
              }
            }
          })
          setProductsData(data)
        }
      } catch (error) {
        console.error('Error fetching product details:', error)
      }
    }

    fetchProductsData()
  }, [items])

  const handleCheckout = async () => {
    // Validar CPF se for o tipo selecionado
    if (localClientInfoType === 'cpf' && localClientInfoValue && !isValidCPF(localClientInfoValue)) {
      return alert('CPF inválido. Insira no formato 000.000.000-00')
    }
    
    // Validar telefone se for o tipo selecionado
    if (localClientInfoType === 'telefone' && localClientInfoValue && !isValidPhone(localClientInfoValue)) {
      return alert('Telefone inválido. Insira no formato (00) 00000-0000')
    }
    
    try {
      setLoading(true)
      setCpf(localCpf)
      setClientInfoType(localClientInfoType)
      setClientInfoValue(localClientInfoValue)

      const sub = subtotal()
      const actualDiscount = discountType === 'percent'
        ? (sub * (Number(discount) || 0)) / 100
        : Number(discount) || 0

      const data = await checkout()

      setReceiptData({
        items: items.map(item => ({
          ...item,
          ...productsData[item.id]
        })),
        subtotal: sub,
        discount: actualDiscount,
        total: total(),
        paymentMethod,
        cpf: localCpf,
        clientName: clientAlert?.text?.replace('Cliente: ', '') || null,
        clientInfoType: localClientInfoType,
        clientInfoValue: localClientInfoValue
      })
      setShowReceipt(true)
      clearCart()
    } catch (e) {
      console.error(e)
      const msg = (e && e.response && e.response.data)
        ? JSON.stringify(e.response.data)
        : String(e)
      alert('Erro ao fechar venda: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const checkCpf = async (rawCpf) => {
    const digits = String(rawCpf || '').replace(/\D/g, '')
    if (!digits || digits.length < 11) {
      setClientAlert(null)
      setClientId(null)
      return
    }
    try {
      const token = window.localStorage.getItem('revir_token')
      const res = await axios.get(
        `${API_BASE_URL}/clients/by-cpf/${digits}`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      )
      if (res.data && res.data.item) {
        const name = res.data.item.name || res.data.item.full_name || res.data.item.fantasy || res.data.item.id
        setClientAlert({ variant: 'success', text: `Cliente: ${name}` })
        setClientId(res.data.item.id)
      } else {
        setClientAlert(null)
        setClientId(null)
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setClientAlert(null)
        setClientId(null)
        return
      }
      console.error('CPF lookup error', err)
    }
  }

  const formatClientInfoValue = (value, type) => {
    switch (type) {
      case 'cpf':
        return formatCPF(value)
      case 'telefone':
        return formatPhone(value)
      default:
        return value
    }
  }

  const getClientInfoLabel = (type) => {
    switch (type) {
      case 'nome':
        return 'Nome do Cliente'
      case 'cpf':
        return 'CPF do Cliente'
      case 'email':
        return 'Email do Cliente'
      case 'telefone':
        return 'Telefone do Cliente'
      default:
        return 'Informação do Cliente'
    }
  }

  const getClientInfoPlaceholder = (type) => {
    switch (type) {
      case 'nome':
        return 'Digite o nome do cliente'
      case 'cpf':
        return '000.000.000-00'
      case 'email':
        return 'cliente@exemplo.com'
      case 'telefone':
        return '(00) 00000-0000'
      default:
        return 'Digite a informação do cliente'
    }
  }

  const getClientInfoMaxLength = (type) => {
    switch (type) {
      case 'cpf':
        return MAX_LENGTH_CPF
      case 'telefone':
        return MAX_LENGTH_PHONE
      default:
        return undefined
    }
  }

  const handleClientInfoTypeChange = (newType) => {
    setLocalClientInfoType(newType)
    setLocalClientInfoValue('')
    setClientAlert(null)
    setClientId(null)
  }

  const handleClientInfoValueChange = (value) => {
    const formattedValue = formatClientInfoValue(value, localClientInfoType)
    setLocalClientInfoValue(formattedValue)
    
    // Se for CPF, fazer a busca automática
    if (localClientInfoType === 'cpf') {
      checkCpf(formattedValue)
    }
  }

  const safeUpdateQty = (id, qty) => {
    const num = Math.max(1, Number(qty) || 1)
    updateQty(id, num)
  }

  const incrementQty = (id) => updateQty(id, (items.find(i => i.id === id)?.qty + 1 || 1))
  const decrementQty = (id) => {
    const currentQty = items.find(i => i.id === id)?.qty || 1
    if (currentQty <= 1) return removeItem(id)
    updateQty(id, currentQty - 1)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
        🛒 Carrinho de Compras
      </Typography>
      
      <Grid container spacing={3}>
        {/* Lista de Itens */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: theme.shadows[2]
          }}>
            {items.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" color="text.secondary">
                  Seu carrinho está vazio
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Adicione produtos para continuar
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                <AnimatePresence>
                  {items.map(it => (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Paper sx={{ 
                        p: 2, 
                        display: 'flex', 
                        gap: 2, 
                        borderRadius: 2,
                        position: 'relative'
                      }}>
                        <Badge
                          badgeContent={productsData[it.id]?.images?.length > 1 ? 
                            `${productsData[it.id]?.images?.length} imagens` : null}
                          color="primary"
                          overlap="rectangular"
                          sx={{
                            '& .MuiBadge-badge': {
                              top: 8,
                              right: 8,
                              borderRadius: 2,
                              px: 1
                            }
                          }}
                        >
                          <Avatar
                            variant="rounded"
                            src={productsData[it.id]?.images?.[0] || '/default-product.png'}
                            alt={it.title}
                            sx={{ 
                              width: 100, 
                              height: 100,
                              bgcolor: theme.palette.grey[100]
                            }}
                          />
                        </Badge>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {it.title}
                          </Typography>
                          
                          {productsData[it.id]?.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {productsData[it.id].description}
                            </Typography>
                          )}

                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            mt: 1.5
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1
                            }}>
                              <IconButton 
                                size="small" 
                                onClick={() => decrementQty(it.id)}
                                sx={{ borderRadius: 0 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              
                              <TextField
                                value={it.qty}
                                onChange={e => safeUpdateQty(it.id, e.target.value)}
                                type="number"
                                size="small"
                                sx={{ 
                                  width: 60,
                                  '& .MuiInputBase-root': {
                                    border: 'none',
                                    height: 40
                                  },
                                  '& .MuiInputBase-input': {
                                    textAlign: 'center',
                                    py: 0.5,
                                    px: 1
                                  }
                                }}
                                inputProps={{ min: 1 }}
                              />
                              
                              <IconButton 
                                size="small" 
                                onClick={() => incrementQty(it.id)}
                                sx={{ borderRadius: 0 }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            <Chip
                              label={`R$ ${(it.price * it.qty).toFixed(2)}`}
                              color="primary"
                              icon={<AttachMoneyIcon fontSize="small" />}
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>

                        <IconButton 
                          onClick={() => removeItem(it.id)}
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            color: 'error.main'
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Paper>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Stack>
            )}

            {items.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                
                {/* Seção de Cliente e Pagamento */}
                <Box sx={{ 
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                    Informações da Compra
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Select
                        value={localClientInfoType}
                        onChange={e => handleClientInfoTypeChange(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Selecione o tipo de informação</em>
                        </MenuItem>
                        <MenuItem value="nome">Nome</MenuItem>
                        <MenuItem value="cpf">CPF</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="telefone">Telefone</MenuItem>
                      </Select>
                      
                      {localClientInfoType && (
                        <TextField
                          label={getClientInfoLabel(localClientInfoType)}
                          value={localClientInfoValue}
                          onChange={e => handleClientInfoValueChange(e.target.value)}
                          fullWidth
                          size="small"
                          placeholder={getClientInfoPlaceholder(localClientInfoType)}
                          inputProps={{ 
                            maxLength: getClientInfoMaxLength(localClientInfoType)
                          }}
                        />
                      )}
                      
                      {clientAlert && (
                        <Chip
                          label={clientAlert.text}
                          color={clientAlert.variant === 'success' ? 'success' : 'error'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="pix">Pix</MenuItem>
                        <MenuItem value="dinheiro">Dinheiro</MenuItem>
                        <MenuItem value="credito">Cartão de Crédito</MenuItem>
                        <MenuItem value="debito">Cartão de Débito</MenuItem>
                        <MenuItem value="outro">Outro</MenuItem>
                      </Select>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          label="Desconto"
                          type="number"
                          value={discount}
                          onChange={e => setDiscount(e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {discountType === 'value' ? 'R$' : '%'}
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Select
                          value={discountType}
                          onChange={e => setDiscountType(e.target.value)}
                          size="small"
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="value">Valor Fixo</MenuItem>
                          <MenuItem value="percent">Percentual</MenuItem>
                        </Select>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Resumo do Pedido */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            position: 'sticky',
            top: 20
          }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
              Resumo do Pedido
            </Typography>
            
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight="500">R$ {subtotal().toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">
                  Desconto {discountType === 'percent' ? `(${discount}%)` : ''}
                </Typography>
                <Typography color="error">
                  - R$ {(discountType === 'percent'
                    ? (subtotal() * (Number(discount) || 0)) / 100
                    : Number(discount) || 0
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="700">Total</Typography>
              <Typography variant="h6" fontWeight="700" color="primary">
                R$ {total().toFixed(2)}
              </Typography>
            </Box>

            {items.length > 0 && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  disabled={loading}
                  startIcon={<ReceiptIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  {loading ? 'Processando...' : 'Finalizar Compra'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={clearCart}
                  startIcon={<DeleteIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Limpar Carrinho
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        receiptData={receiptData}
      />
    </Container>
  )
}