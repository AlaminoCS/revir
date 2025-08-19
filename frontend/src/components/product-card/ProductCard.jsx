import { Box, Card, CardContent, CardActions, Button, Typography, TextField } from '@mui/material';

export function ProductCard({ product, qtys, handleQty, addItem }) {
  return (
    <Card sx={{ 
      transition: 'transform 220ms ease, box-shadow 220ms ease',
      border: '1px solid #ddd',
      '&:hover': { 
        transform: 'translateY(-6px)', 
        boxShadow: '0 12px 36px rgba(2,6,23,0.12)' 
      },
      borderRadius: 2,
      overflow: 'hidden',
      maxWidth: 345,
      mx: 'auto'
    }}>
      <Box 
        component="img" 
        src={product.image || '/default-clothing.svg'} 
        alt={product.title} 
        sx={{ 
          width: '100%', 
          height: 260, 
          objectFit: 'cover',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }} 
      />
      
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {product.title}
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.primary"
          sx={{ 
            fontSize: '1.25rem',
            fontWeight: 700,
            mb: 2
          }}
        >
          R$ {Number(product.price).toFixed(2)}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <TextField 
            label="Quantidade" 
            type="number" 
            size="small" 
            value={qtys[product.id] || 1} 
            onChange={e => handleQty(product.id, e.target.value)} 
            inputProps={{ min: 1 }} 
            sx={{ width: 120 }} 
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button 
          variant="contained" 
          fullWidth
          onClick={() => addItem(product, qtys[product.id] || 1)}
          sx={{
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            borderRadius: 1
          }}
        >
          Adicionar ao Carrinho
        </Button>                    
      </CardActions>
    </Card>
  );
}