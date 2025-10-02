import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axios from 'axios';
import { generateAndPrintReport } from '../components/ReportPrinter';
import Grid2 from '@mui/material/Unstable_Grid2';

function getSaleDate(sale) {
  return sale.createdAt ? new Date(sale.createdAt) : sale.created_at ? new Date(sale.created_at) : new Date()
}

function getSaleTotal(sale) {
  if (typeof sale.total === 'number') return Number(sale.total)
  if (sale.total) return Number(sale.total)
  // fallback compute from products array
  if (Array.isArray(sale.products)) {
    return sale.products.reduce((s, p) => s + (Number(p.price || 0) * (Number(p.qty || 0) || 0)), 0)
  }
  return 0
}

function groupByDay(items, dateFrom, dateTo) {
  const map = {}
  let minDate = null
  let maxDate = null
  items.forEach((it) => {
    const d = getSaleDate(it)
    const key = d.toISOString().slice(0, 10)
    map[key] = (map[key] || 0) + getSaleTotal(it)
    if (!minDate || d < minDate) minDate = new Date(d)
    if (!maxDate || d > maxDate) maxDate = new Date(d)
  })

  // determine range to show: prefer explicit dateFrom/dateTo, otherwise use min/max from data
  let start, end
  if (dateFrom) start = new Date(dateFrom + 'T00:00:00')
  else if (minDate) { start = new Date(minDate); start.setHours(0,0,0,0) }
  if (dateTo) end = new Date(dateTo + 'T23:59:59')
  else if (maxDate) { end = new Date(maxDate); end.setHours(23,59,59,999) }

  // if no range and no items, return empty
  if (!start || !end) {
    return { days: Object.keys(map).sort(), values: Object.keys(map).sort().map((d) => map[d]) }
  }

  // build continuous sequence of days and fill zeros where needed
  const days = []
  const values = []
  const cur = new Date(start)
  cur.setHours(0,0,0,0)
  const last = new Date(end)
  last.setHours(0,0,0,0)
  while (cur <= last) {
    const key = cur.toISOString().slice(0,10)
    days.push(key)
    values.push(map[key] || 0)
    cur.setDate(cur.getDate() + 1)
  }
  return { days, values }
}

function countByPayment(items) {
  const map = {}
  items.forEach((it) => {
    const pm = String(it.payment_method || it.paymentMethod || 'outro').toLowerCase()
    const label = pm === 'pix' ? 'Pix' : pm === 'débito' || pm === 'debito' ? 'Débito' : pm === 'crédito' || pm === 'credito' ? 'Crédito' : pm === 'dinheiro' ? 'Dinheiro' : 'Outro'
    map[label] = (map[label] || 0) + getSaleTotal(it)
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

export function Relatorios() {
  const [items, setItems] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    let mounted = true
    const token = window.localStorage.getItem('revir_token')
    axios
      .get('http://localhost:4000/sales', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      .then((r) => {
        if (mounted && r.data?.items) setItems(r.data.items)
      })
      .catch((err) => {
        console.error('Failed to load sales', err?.response?.data || err.message || err)
        if (mounted) setItems([])
      })
    return () => {
      mounted = false
    }
  }, [])

  // --- Date filter state ---
  const [period, setPeriod] = useState('todos') // todos, ultimos7, semanaAtual, mesAtual, anoAtual, mes, ano, personalizado
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  // temp inputs so typing doesn't immediately apply filter
  const [tempDateFrom, setTempDateFrom] = useState('')
  const [tempDateTo, setTempDateTo] = useState('')
  // month picker value like '2025-08'
  const [monthPicker, setMonthPicker] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })

  function startOfWeek(d) {
    const dt = new Date(d)
    const day = dt.getDay()
    const diff = (day + 6) % 7 // make Monday = 0
    dt.setDate(dt.getDate() - diff)
    dt.setHours(0,0,0,0)
    return dt
  }
  function endOfDay(d) {
    const dt = new Date(d)
    dt.setHours(23,59,59,999)
    return dt
  }

  function applyPreset(p) {
    const now = new Date()
    if (p === 'todos') {
      setDateFrom(null); setDateTo(null)
    } else if (p === 'ultimos7') {
      const to = endOfDay(now)
      const from = new Date()
      from.setDate(now.getDate() - 6)
      from.setHours(0,0,0,0)
      setDateFrom(from.toISOString().slice(0,10))
      setDateTo(to.toISOString().slice(0,10))
    } else if (p === 'semanaAtual') {
      const from = startOfWeek(now)
      const to = endOfDay(new Date(from.getTime() + 6 * 24 * 60 * 60 * 1000))
      setDateFrom(from.toISOString().slice(0,10))
      setDateTo(to.toISOString().slice(0,10))
    } else if (p === 'mesAtual') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = endOfDay(new Date(now.getFullYear(), now.getMonth()+1, 0))
      setDateFrom(from.toISOString().slice(0,10))
      setDateTo(to.toISOString().slice(0,10))
    } else if (p === 'anoAtual') {
      const from = new Date(now.getFullYear(), 0, 1)
      const to = endOfDay(new Date(now.getFullYear(), 11, 31))
      setDateFrom(from.toISOString().slice(0,10))
      setDateTo(to.toISOString().slice(0,10))
    } else if (p === 'mes') {
      // no-op here; use applyMonth with monthPicker instead
    } else if (p === 'ano') {
      // handled via month/year pickers if needed
    }
    setPeriod(p)
  }

  function applyMonth(value) {
    // value expected 'YYYY-MM'
    if (!value) return
    const [y, m] = String(value).split('-').map(Number)
    if (!y || !m) return
    const from = new Date(y, m - 1, 1)
    const to = endOfDay(new Date(y, m, 0))
    setDateFrom(from.toISOString().slice(0,10))
    setDateTo(to.toISOString().slice(0,10))
    setPeriod('mes')
    setMonthPicker(value)
  }

  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return []
    if (!dateFrom && !dateTo) return items
    const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : new Date(0)
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date()
    return items.filter(it => {
      const d = getSaleDate(it)
      return d >= from && d <= to
    })
  }, [items, dateFrom, dateTo])

  const totalWeek = useMemo(() => {
    // total for currently selected filtered items
    return filteredItems.reduce((s, i) => s + getSaleTotal(i), 0)
  }, [filteredItems])

  const piecesSold = useMemo(() => {
    return filteredItems.reduce((sum, sale) => {
      if (Array.isArray(sale.products)) return sum + sale.products.reduce((ss, p) => ss + (Number(p.qty || 0) || 0), 0)
      return sum
    }, 0)
  }, [filteredItems])

  const averageTicket = useMemo(() => (totalWeek > 0 && piecesSold > 0 ? totalWeek / piecesSold : 0), [totalWeek, piecesSold])

  const salesSeries = useMemo(() => groupByDay(filteredItems, dateFrom, dateTo), [filteredItems, dateFrom, dateTo])
  const pieData = useMemo(() => countByPayment(filteredItems), [filteredItems])

  // --- Report modal state ---
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportType, setReportType] = useState('day') // 'day' or 'month'
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0,10))
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })

  function generateReport() {
    if (reportType === 'day') {
      generateAndPrintReport({ items, type: 'day', date: reportDate, shopName: 'Revir, Moda sustentàvel' })
    } else {
      generateAndPrintReport({ items, type: 'month', month: reportMonth, shopName: 'Revir, Moda sustentàvel' })
    }
    setReportModalOpen(false)
  }

  // Estilização dos gráficos
  const lineOptions = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0];
        return `${p.name}<br/><strong>R$ ${p.value.toFixed(2)}</strong>`;
      },
    },
    xAxis: {
      type: 'category',
      data: salesSeries.days,
      axisLabel: { rotate: isMobile ? 45 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: 'R$ {value}' },
    },
    series: [
      {
        data: salesSeries.values,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(52, 152, 219, 0.5)' },
              { offset: 1, color: 'rgba(52, 152, 219, 0.1)' },
            ],
          },
        },
        itemStyle: { color: '#2980b9' },
        lineStyle: { width: 3, color: '#3498db' },
      },
    ],
    grid: { right: '5%', left: '8%', bottom: '10%', top: '8%' },
  };

  const pieOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <strong>R$ {c}</strong> ({d}%)',
    },
    legend: {
      bottom: 10,
      data: pieData.map((d) => d.name),
      textStyle: { color: theme.palette.text.primary },
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: pieData,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' } },
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  };

  return (
    <>
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="text.secondary" fontWeight="500">
          Olá, Cleide 👋
        </Typography>
        <Typography variant="h3" fontWeight="700" color="text.primary">
          Relatórios de Compras
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Acompanhe o desempenho das compras e tendências de fornecedores.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setReportModalOpen(true)}>Gerar relatório</Button>
        </Box>
      </Box>

      {/* Filtros de período */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center">
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant={period === 'todos' ? 'contained' : 'outlined'} onClick={() => applyPreset('todos')}>Todos</Button>
            <Button variant={period === 'ultimos7' ? 'contained' : 'outlined'} onClick={() => applyPreset('ultimos7')}>Últimos 7 dias</Button>
            <Button variant={period === 'semanaAtual' ? 'contained' : 'outlined'} onClick={() => applyPreset('semanaAtual')}>Semana atual</Button>
            <Button variant={period === 'mesAtual' ? 'contained' : 'outlined'} onClick={() => applyPreset('mesAtual')}>Mês atual</Button>
            <Button variant={period === 'anoAtual' ? 'contained' : 'outlined'} onClick={() => applyPreset('anoAtual')}>Ano</Button>
          </Box>          
        </Stack>
      </Paper>

      

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid2 container spacing={2} alignItems="stretch">
          <Grid2 xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField label="De" type="date" size="small" value={tempDateFrom || ''} onChange={e => setTempDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField label="Até" type="date" size="small" value={tempDateTo || ''} onChange={e => setTempDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button variant="outlined" size="small" onClick={() => { setDateFrom(tempDateFrom || null); setDateTo(tempDateTo || null); setPeriod('personalizado') }}>Aplicar</Button>
                <Button variant="text" size="small" onClick={() => { setTempDateFrom(''); setTempDateTo(''); setDateFrom(null); setDateTo(null); setPeriod('todos') }}>Limpar</Button>
              </Box>
            </Box>
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'start', height: '100%' }}>
              <Box>
                <TextField
                  label="Mês/Ano"
                  type="month"
                  size="small"
                  value={monthPicker}
                  onChange={e => setMonthPicker(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button variant="outlined" size="small" onClick={() => applyMonth(monthPicker)}>Aplicar mês</Button>
                <Button variant="text" size="small" onClick={() => { setMonthPicker(''); setDateFrom(null); setDateTo(null); setPeriod('todos') }}>Limpar</Button>
              </Box>
            </Box>
          </Grid2>
        </Grid2>
        

        
      </Paper>

      {/* KPIs - Cards Modernos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 16px rgba(0, 123, 255, 0.1)',
              border: '1px solid #E3F2FD',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0, 123, 255, 0.15)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <TrendingUpIcon sx={{ color: '#3498db' }} />
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Vendas na Semana
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="700" color="text.primary">
              R$ {totalWeek.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip
                label="+100%"
                size="small"
                color="success"
                sx={{ fontWeight: 'bold', height: 22 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                vs semana anterior
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 16px rgba(46, 204, 113, 0.1)',
              border: '1px solid #E8F5E9',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(46, 204, 113, 0.15)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <InventoryIcon sx={{ color: '#27ae60' }} />
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Peças Compradas
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="700" color="text.primary">
              {piecesSold}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total de itens adquiridos
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 16px rgba(155, 89, 182, 0.1)',
              border: '1px solid #F3E5F5',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(155, 89, 182, 0.15)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LocalOfferIcon sx={{ color: '#8e44ad' }} />
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Ticket Médio
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="700" color="text.primary">
              R$ {averageTicket.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Valor médio por peça
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de Linha */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: 2,
              height: 400,
            }}
          >
            <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 2 }}>
              Evolução de Compras
            </Typography>
            <ReactECharts option={lineOptions} style={{ height: '320px', width: '100%' }} />
          </Paper>
        </Grid>

        {/* Gráfico de Pizza */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: 2,
              height: 400,
            }}
          >
            <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 2 }}>
              Formas de Pagamento
            </Typography>
            <ReactECharts option={pieOptions} style={{ height: '320px', width: '100%' }} />
          </Paper>
        </Grid>
      </Grid>

    
  </Container>
  <Dialog open={reportModalOpen} onClose={() => setReportModalOpen(false)}>
      <DialogTitle>Gerar relatório</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <RadioGroup value={reportType} onChange={e => setReportType(e.target.value)} row>
            <FormControlLabel value="day" control={<Radio />} label="Diário" />
            <FormControlLabel value="month" control={<Radio />} label="Mensal" />
          </RadioGroup>
        </Box>
        {reportType === 'day' ? (
          <Box sx={{ mt: 2 }}>
            <TextField label="Data" type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <TextField label="Mês" type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReportModalOpen(false)}>Cancelar</Button>
        <Button variant="contained" onClick={generateReport}>Gerar e Imprimir</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}