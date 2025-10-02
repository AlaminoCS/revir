import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Pagination,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Chip,
  Badge,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon,
  LocalOffer as LocalOfferIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const STORAGE_KEY = 'revir_sales';

// Helper functions remain the same
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfYear(d) {
  const x = new Date(d);
  x.setMonth(0, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Map payment method to display label and Chip color
function getPaymentBadge(pm) {
  const raw = String(pm || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  if (!raw) return { label: '—', color: 'default' }
  if (raw.includes('pix')) return { label: 'Pix', color: 'success' }
  if (raw.includes('dinheiro')) return { label: 'Dinheiro', color: 'warning' }
  if (raw.includes('debito')) return { label: 'Débito', color: 'info' }
  if (raw.includes('credito') || raw.includes('cartao')) return { label: 'Crédito', color: 'primary' }
  return { label: pm || String(pm), color: 'default' }
}

// Map client info type to display label and Chip color
function getClientInfoBadge(type, value) {
  if (!type || !value) return { label: '—', color: 'default', type: null }
  
  const typeMap = {
    'nome': { label: 'Nome', color: 'primary', icon: '👤' },
    'cpf': { label: 'CPF', color: 'success', icon: '🆔' },
    'email': { label: 'Email', color: 'info', icon: '📧' },
    'telefone': { label: 'Telefone', color: 'warning', icon: '📱' }
  }
  
  const config = typeMap[type] || { label: type, color: 'default', icon: '❓' }
  return { 
    label: `${config.icon} ${config.label}`, 
    color: config.color, 
    type: type,
    value: value
  }
}

export function Vendas() {
  const [period, setPeriod] = useState('mes');
  const [items, setItems] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [paymentFilter, setPaymentFilter] = useState('Todas');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Data fetching remains the same
  useEffect(() => {
    let mounted = true;
    const token = window.localStorage.getItem('revir_token');

    axios
      .get(`${API_BASE_URL}/sales`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      .then((r) => {
        if (!mounted) return;
        const raw = (r.data?.items) || [];
    const normalized = raw.map((it) => ({
          id: it.id,
          total: it.total || it.value || 0,
          createdAt: it.created_at || it.createdAt || null,
          products: it.products || [],
          qty: it.products
            ? it.products.reduce((s, p) => s + (p.qty || 0), 0)
            : it.qty || 0,
            // client CPF may come joined under client.cpf or as client_cpf
            clientCpf: (it.client && (it.client.cpf || it.client.CPF)) || it.client_cpf || null,
            // new client info fields
            clientInfoType: it.client_info_type || null,
            clientInfoValue: it.client_info_value || null,
      payment_method: it.payment_method || '—',
      // payment badge
      ...(function(){ const b = getPaymentBadge(it.payment_method || it.paymentMethod || it.payment || ''); return { paymentLabel: b.label, paymentColor: b.color } })(),
      // client info badge
      ...(function(){ const b = getClientInfoBadge(it.client_info_type, it.client_info_value); return { clientInfoLabel: b.label, clientInfoColor: b.color, clientInfoType: b.type, clientInfoValue: b.value } })(),
          notes: it.notes || it.note || null,
        }));
        if (mounted) setItems(normalized);
      })
      .catch(() => {
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

  // Filtering logic remains the same
  const filtered = useMemo(() => {
    const now = new Date();
    let from = startOfMonth(now);
    if (period === 'hoje') from = startOfDay(now);
    if (period === 'semana') from = startOfWeek(now);
    if (period === 'mes') from = startOfMonth(now);
    if (period === 'ano') from = startOfYear(now);

    return items.filter((it) => {
      const d = it.createdAt ? new Date(it.createdAt) : new Date();

      // Aplicar filtro de período apenas se não houver filtros específicos de mês/ano
      if (filterMonth === 0 && filterYear === new Date().getFullYear()) {
        if (d < from) return false;
      } else {
        // Aplicar filtros específicos de mês e ano
        if (filterYear && d.getFullYear() !== Number(filterYear)) return false;
        if (filterMonth && filterMonth > 0 && d.getMonth() + 1 !== Number(filterMonth))
          return false;
      }
  if (paymentFilter !== 'Todas') {
        // Mapear valores do select para labels de pagamento
        const paymentMap = {
          'Pix': 'Pix',
          'Cartão': ['Crédito', 'Débito'],
          'Dinheiro': 'Dinheiro'
        }
        const expectedPayments = paymentMap[paymentFilter]
        if (Array.isArray(expectedPayments)) {
          if (!expectedPayments.includes(it.paymentLabel)) return false
        } else {
          if (it.paymentLabel !== expectedPayments) return false
        }
      }

      if (search) {
        const query = search.toLowerCase();
        return (
          String(it.id).includes(query) ||
          String(it.total).includes(query) ||
          String(it.clientCpf || '').toLowerCase().includes(query) ||
          String(it.clientInfoValue || '').toLowerCase().includes(query) ||
          String(it.clientInfoType || '').toLowerCase().includes(query) ||
          String(it.payment_method).toLowerCase().includes(query) ||
          String(it.paymentLabel || '').toLowerCase().includes(query) ||
          d.toLocaleString().includes(query) ||
          (it.products || []).some((p) => 
            (p.title || p.name || '').toLowerCase().includes(query)
          )
        );
      }

      return true;
    });
  }, [items, period, filterMonth, filterYear, paymentFilter, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page]);

  // Metrics calculation
  const totalCount = filtered.length;
  const totalValue = useMemo(
    () => filtered.reduce((s, it) => s + Number(it.total || it.value || 0), 0),
    [filtered]
  );
  const avgValue = totalCount ? totalValue / totalCount : 0;
  const lastSaleDate = useMemo(() => {
    if (!items.length) return '—';
    return new Date(items[items.length - 1].createdAt).toLocaleString();
  }, [items]);

   
  const avgTrend = 'neutral';

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: isSmallScreen ? 'column' : 'row',
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="600" color="text.primary">
          📊 Relatório de Vendas
        </Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(e, v) => {
            if (v) {
              setPeriod(v)
              setPage(1) // Reset página ao mudar período
            }
          }}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '12px',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.8,
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px !important',
              border: '1px solid #E0E0E0',
              color: 'text.secondary',
            },
            '& .Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white !important',
              fontWeight: 600,
            },
          }}
        >
          <ToggleButton value="hoje">Hoje</ToggleButton>
          <ToggleButton value="semana">Semana</ToggleButton>
          <ToggleButton value="mes">Mês</ToggleButton>
          <ToggleButton value="ano">Ano</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Modern KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #ddd' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <TrendingUpIcon sx={{ color: 'primary.dark' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Vendas
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h5" fontWeight="bold">
                    {totalCount}
                  </Typography>
                  
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #ddd' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'success.light' }}>
                <MonetizationOnIcon sx={{ color: 'success.dark' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Valor Total
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {totalValue.toFixed(2)}
                  </Typography>
                  
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #ddd' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'warning.light' }}>
                <LocalOfferIcon sx={{ color: 'warning.dark' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Valor Médio
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {avgValue.toFixed(2)}
                  </Typography>
                  {avgTrend !== 'neutral' && (
                    <Badge
                      color={avgTrend === 'up' ? 'success' : 'error'}
                      badgeContent={
                        avgTrend === 'up' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      }
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #ddd' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'info.light' }}>
                <CalendarTodayIcon sx={{ color: 'info.dark' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Última Venda
                </Typography>
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {lastSaleDate}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters - remains the same */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          alignItems: 'center',
        }}
      >
        <TextField
          placeholder="Buscar vendas..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          size="small"
          variant="outlined"
          sx={{
            flexGrow: 1,
            maxWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Mês</InputLabel>
          <Select
            label="Mês"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setPage(1);
            }}
            sx={{ borderRadius: '12px' }}
          >
            <MenuItem value={0}>Todos</MenuItem>
            {months.map((m) => (
              <MenuItem key={m} value={m}>
                {new Date(2024, m - 1).toLocaleString('pt-BR', { month: 'short' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Ano</InputLabel>
          <Select
            label="Ano"
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setPage(1);
            }}
            sx={{ borderRadius: '12px' }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Forma</InputLabel>
          <Select
            label="Forma de Pagamento"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            sx={{ borderRadius: '12px' }}
          >
            <MenuItem value="Todas">
              <em>Todas</em>
            </MenuItem>
            <MenuItem value="Pix">
              <Chip label="Pix" size="small" color="success" sx={{ height: 22 }} />
            </MenuItem>
            <MenuItem value="Cartão">
              <Chip label="Cartão" size="small" color="primary" sx={{ height: 22 }} />
            </MenuItem>
            <MenuItem value="Dinheiro">
              <Chip label="Dinheiro" size="small" color="warning" sx={{ height: 22 }} />
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table - remains the same */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Pagamento</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Itens</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((it) => (
                  <TableRow
                    key={it.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transition: 'background-color 0.2s',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>R$ {Number(it.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={it.paymentLabel || it.payment_method}
                        size="small"
                        color={it.paymentColor || 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {new Date(it.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {it.products?.length > 0
                        ? `${it.products.length} produto(s)`
                        : `${it.qty} peça(s)`}
                    </TableCell>
                    
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Nenhuma venda encontrada com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination - remains the same */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Mostrando{' '}
            <strong>
              {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, totalCount)}
            </strong>{' '}
            de <strong>{totalCount}</strong> vendas
          </Typography>
          <Pagination
            count={Math.ceil(totalCount / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size={isSmallScreen ? 'small' : 'medium'}
            sx={{ ml: 'auto' }}
          />
        </Box>
      </Paper>
    </Container>
  );
}