import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Container, 
  Grid, 
  Typography,
  Badge,
  useTheme,
  Chip,
  Button,
  TextField,
  IconButton
} from '@mui/material'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { API_BASE_URL } from '../utils/constants'
import { PromoBanner } from '../components/promo-banner/'
import { 
  Image as ImageIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material'

export function Home() {
  const [items, setItems] = useState([])
  const [qtys, setQtys] = useState({})
  const { addItem } = useCart()
  const theme = useTheme()

  useEffect(() => {
    let mounted = true
    axios.get(`${API_BASE_URL}/products`)
      .then(r => {
        if (mounted && r.data && r.data.items) {
          const normalizedItems = r.data.items.map(item => ({
            ...item,
            images: item.images || [],
            price: Number(item.price) || 0
          }))
          setItems(normalizedItems)
          const initial = {}
          normalizedItems.forEach(it => { initial[it.id] = 1 })
          setQtys(initial)
        }
      })
      .catch(e => console.error(e))
    return () => { mounted = false }
  }, [])

  const handleQty = (id, v) => setQtys(s => ({ ...s, [id]: Math.max(1, Number(v) || 1) }))

 

  const incrementQty = (id) => setQtys(s => ({ ...s, [id]: (s[id] || 1) + 1 }))
  const decrementQty = (id) => setQtys(s => ({ ...s, [id]: Math.max(1, (s[id] || 1) - 1) }))

  // Componente de card de produto otimizado
  const ProductItem = ({ product }) => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 4
        }
      }}
    >
      <Badge
        badgeContent={product.images?.length > 1 ? `${product.images.length} imagens` : null}
        color="primary"
        overlap="rectangular"
        sx={{
          '& .MuiBadge-badge': {
            top: 12,
            right: 12,
            borderRadius: 2,
            px: 1
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: 200,
            bgcolor: theme.palette.grey[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <ImageIcon color="disabled" sx={{ fontSize: 60 }} />
          )}
        </Box>
      </Badge>

      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight="600" noWrap>
            {product.name}
          </Typography>
          <Chip
            label={`R$ ${product.price.toFixed(2)}`}
            color="primary"
            size="small"
            sx={{ fontWeight: 'bold', ml: 1 }}
          />
        </Box>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2
            }}
          >
            {product.description}
          </Typography>
        )}
      </Box>

      <Box sx={{ p: 2, pt: 0 }}>
        {/* Controles de quantidade */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          gap: 1
        }}>
          <IconButton 
            size="small" 
            onClick={() => decrementQty(product.id)}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          
          <TextField
            value={qtys[product.id] || 1}
            onChange={(e) => handleQty(product.id, e.target.value)}
            type="number"
            size="small"
            sx={{ 
              width: 60,
              '& .MuiInputBase-input': {
                textAlign: 'center',
                py: 1
              }
            }}
            inputProps={{ min: 1 }}
          />
          
          <IconButton 
            size="small" 
            onClick={() => incrementQty(product.id)}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Botões de ação */}
        <Box sx={{ display: 'flex', gap: 1 }}>          
          <Button
            variant="outlined"
            color="primary"
            onClick={() => addItem(product, qtys[product.id] || 1)}
            sx={{ borderRadius: 2, minWidth: 40, px: 1 }}
          >Adicionar ao carrinho</Button>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>      
      <PromoBanner text="Moda Primavera chegando!" />
      
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom sx={{ mb: 4 }}>
          Nossos Produtos
        </Typography>

        {items.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 1,
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <ImageIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum produto disponível no momento
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {items.map(item => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <ProductItem product={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}