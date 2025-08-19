import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
  Badge,
  Stack,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Image as ImageIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';

const STORAGE_KEY = 'revir_products';

function emptyProduct() {
  return { id: null, name: '', price: 0, description: '', images: [] };
}

export function Produtos() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [imageUrl, setImageUrl] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    let mounted = true;
    const token = window.localStorage.getItem('revir_token');
    axios
      .get('http://localhost:4000/products', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      .then((r) => {
        if (mounted && r.data?.items) setItems(r.data.items);
      })
      .catch((err) => {
        console.error('Failed to fetch products from backend', err);
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw && mounted) setItems(JSON.parse(raw));
        } catch (e) {
          console.error(e);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [items]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct());
    setOpen(true);
  };

  const openEdit = (it) => {
    setEditing(it.id);
    setForm({ ...it });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyProduct());
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!confirm('Excluir este produto? Esta ação não pode ser desfeita.')) return;
    const token = window.localStorage.getItem('revir_token');
    axios
      .delete(`http://localhost:4000/products/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      .then(() => setItems((s) => s.filter((i) => i.id !== id)))
      .catch((err) => {
        console.error('Delete failed', err);
        setItems((s) => s.filter((i) => i.id !== id)); // fallback
      });
  };

  const handleImageAdd = (url) => {
    if (!url) return;
    setForm((f) => ({
      ...f,
      images: [...(f.images || []), url.trim()],
    }));
  };

  const handleImageRemove = (index) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return alert('Nome é obrigatório');
    if (!form.price || isNaN(form.price) || form.price <= 0)
      return alert('Preço deve ser um valor positivo');

    const token = window.localStorage.getItem('revir_token');
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      price: Number(form.price),
      images: form.images || [],
    };

    try {
      if (editing) {
        const res = await axios.put(`http://localhost:4000/products/${editing}`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (res.data?.item) {
          setItems((s) => s.map((i) => (i.id === editing ? res.data.item : i)));
        }
      } else {
        const res = await axios.post('http://localhost:4000/products', payload, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (res.data?.item) {
          setItems((s) => [...s, res.data.item]);
        } else {
          setItems((s) => [...s, { id: Date.now().toString(), ...payload }]);
        }
      }
      handleClose();
    } catch (err) {
      console.error('Save failed', err);
      if (editing) {
        setItems((s) => s.map((i) => (i.id === editing ? { ...i, ...form } : i)));
      } else {
        setItems((s) => [...s, { id: Date.now().toString(), ...form }]);
      }
      handleClose();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho Modernizado */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          p: 3,
          borderRadius: 3,
          color: 'white',
          boxShadow: 3
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            🛍️ Catálogo de Produtos
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Gerencie seu inventário com facilidade
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={openNew}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: 3,
            '&:hover': {
              transform: 'translateY(-2px)',
              transition: 'transform 0.2s'
            }
          }}
        >
          Novo Produto
        </Button>
      </Box>

      {/* Lista de Produtos - Layout Melhorado */}
      {items.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 1,
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <ImageIcon color="disabled" sx={{ fontSize: 60 }} />
          <Typography variant="h6" color="text.secondary">
            Seu catálogo está vazio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comece adicionando seu primeiro produto
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openNew}
            sx={{ mt: 2 }}
          >
            Adicionar Produto
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {items.map((it) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={it.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 4
                  }
                }}
              >
                <Badge
                  badgeContent={
                    it.images?.length > 1 ? `${it.images.length} imagens` : null
                  }
                  color="primary"
                  overlap="rectangular"
                  sx={{
                    '& .MuiBadge-badge': {
                      top: 16,
                      right: 16,
                      borderRadius: 2,
                      px: 1
                    }
                  }}
                >
                  <CardMedia
                    component="div"
                    alt={it.name}
                    sx={{
                      height: 200,
                      width: '100%',
                      backgroundImage: `url(${it.images?.[0] || '/default-product.png'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      bgcolor: theme.palette.grey[100]
                    }}
                  />
                </Badge>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {it.name}
                      </Typography>
                      <Chip
                        label={`R$ ${Number(it.price).toFixed(2)}`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 'bold', ml: 1 }}
                      />
                    </Box>
                    {it.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 60
                        }}
                      >
                        <DescriptionIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 0.5, verticalAlign: 'middle' }}
                        />
                        {it.description}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 1
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={() => openEdit(it)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => handleDelete(it.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    >
                      Excluir
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Cadastro/Edição - Design Atualizado */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            px: 3
          }}
        >
          {editing ? 'Editar Produto' : 'Novo Produto'}
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <TextField
                  label="Nome do Produto"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  fullWidth
                  required
                  autoFocus
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <TextField
                  label="Preço (R$)"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  fullWidth
                  required
                  variant="outlined"
                  InputProps={{
                    inputProps: { min: 0.01, step: 0.01 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
                <TextField
                  label="Descrição"
                  multiline
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  fullWidth
                  placeholder="Detalhes sobre o produto..."
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Imagens do Produto
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  minHeight: 200,
                  bgcolor: theme.palette.grey[50]
                }}
              >
                {(form.images || []).length > 0 ? (
                  <Grid container spacing={2}>
                    {form.images.map((img, idx) => (
                      <Grid item xs={6} sm={4} key={idx}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            variant="rounded"
                            src={img}
                            sx={{
                              width: '100%',
                              height: 120,
                              border: '2px solid',
                              borderColor: 'divider',
                              // ensure the inner <img> is cropped and fills the box
                              '& img': {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }
                            }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleImageRemove(idx)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'background.paper',
                              '&:hover': {
                                bgcolor: 'error.light',
                                color: 'white'
                              }
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 200,
                      color: 'text.secondary'
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 60, mb: 1 }} />
                    <Typography>Nenhuma imagem adicionada</Typography>
                  </Box>
                )}
              </Paper>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <TextField
                  placeholder="Cole a URL da imagem"
                  size="small"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (imageUrl) {
                      handleImageAdd(imageUrl);
                      setImageUrl('');
                    }
                  }}
                  sx={{ borderRadius: 2, minWidth: 120 }}
                >
                  Adicionar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              '&:hover': {
                boxShadow: 2
              }
            }}
          >
            {editing ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}