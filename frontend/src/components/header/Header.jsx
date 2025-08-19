import React from 'react'
import { NavLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Grow from '@mui/material/Grow'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import MenuIcon from '@mui/icons-material/Menu'
import { ShoppingCart } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAccessibility } from '../../context/AccessibilityContext'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { navItems } from '../../utils/constants'

export function Header() {
  const { increase, decrease, reset, scale } = useAccessibility()
  const { logout } = useAuth()
  const { items, removeItem, subtotal } = useCart()

  const itemCount = items.reduce((s, it) => s + Number(it.qty || 0), 0)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const open = Boolean(anchorEl)
  const handleOpen = (e) => {
    if (isSm) setDrawerOpen(true)
    else setAnchorEl(e.currentTarget)
  }
  const handleClose = () => { setAnchorEl(null); setDrawerOpen(false) }
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const [navOpen, setNavOpen] = React.useState(false)

  

  return (
    <AppBar
      position="fixed"
      elevation={6}
      sx={{
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, width: '100%' }}>
        

        {/* Mobile menu button */}
        {isSm && (
          <IconButton onClick={() => setNavOpen(true)} color="inherit" size="large" aria-label="Abrir menu">
            <MenuIcon />
          </IconButton>
        )}

        <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }} aria-label="Main navigation">
          {navItems.map(n => (
            <Button
              key={n.to}
              component={NavLink}
              to={n.to}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              sx={{
                color: 'primary.contrastText',
                textTransform: 'none',
                fontWeight: 600,
                '&.active': { color: 'info.contrastText', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1 }
              }}
            >
              {n.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }} aria-hidden>
            <Tooltip title="Diminuir fonte">
              <Button size="small" variant="outlined" color="inherit" onClick={decrease} sx={{ minWidth: 36 }}>A-</Button>
            </Tooltip>
            <Tooltip title="Resetar fonte">
              <Button size="small" variant="outlined" color="inherit" onClick={reset} sx={{ minWidth: 36 }}>A</Button>
            </Tooltip>
            <Tooltip title="Aumentar fonte">
              <Button size="small" variant="outlined" color="inherit" onClick={increase} sx={{ minWidth: 36 }}>A+</Button>
            </Tooltip>
          </Box>

          <IconButton aria-label="Abrir carrinho" onClick={handleOpen} size="large" sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <Badge badgeContent={itemCount} color="secondary">
              <motion.div key={itemCount} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>{<ShoppingCart />}</motion.div>
            </Badge>
          </IconButton>

          <Button size="small" onClick={() => logout()} aria-label="Sair" sx={{ color: 'primary.contrastText' }}>Sair</Button>
        </Box>
      </Toolbar>

      {/* Desktop Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, borderRadius: 2, p: 1 } }}
        TransitionComponent={Grow}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Resumo do Carrinho</Typography>
          <Divider sx={{ my: 1 }} />
          {items.length === 0 ? (
            <Typography sx={{ py: 2 }}>Seu carrinho está vazio.</Typography>
          ) : (
            <List dense>
              <AnimatePresence initial={false}>
                {items.map(it => (
                  <motion.div key={it.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                    <ListItem divider>
                      <Avatar src={it.image || '/default-clothing.svg'} sx={{ width: 44, height: 44, mr: 1, '& img': { objectFit: 'cover' } }} />
                      <ListItemText primary={it.title} secondary={`Qtd: ${it.qty} — R$ ${Number(it.price).toFixed(2)}`} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="remove" onClick={() => removeItem(it.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}

          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Subtotal</Typography>
            <Typography variant="subtitle2">R$ {Number(subtotal()).toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button fullWidth component={NavLink} to="/cart" onClick={handleClose}>Ver Carrinho</Button>            
          </Box>
        </Box>
      </Popover>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleClose} PaperProps={{ sx: { width: 360, borderRadius: 2 } }}>
        <Box sx={{ width: 360, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Carrinho</Typography>
          <Divider sx={{ my: 1 }} />
          {items.length === 0 ? (
            <Typography sx={{ py: 2 }}>Seu carrinho está vazio.</Typography>
          ) : (
            <List>
              {items.map(it => (
                <ListItem key={it.id} divider>
                      <Avatar src={it.image || '/default-clothing.svg'} sx={{ width: 56, height: 56, mr: 1, '& img': { objectFit: 'cover' } }} />
                  <ListItemText primary={it.title} secondary={`Qtd: ${it.qty} — R$ ${Number(it.price).toFixed(2)}`} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="remove" onClick={() => removeItem(it.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
          <Box sx={{ mt: 2 }}>
            <Button fullWidth component={NavLink} to="/cart" onClick={handleClose}>Ver Carrinho</Button>
          </Box>
        </Box>
      </Drawer>

          {/* Mobile nav drawer */}
          <Drawer anchor="left" open={navOpen} onClose={() => setNavOpen(false)} PaperProps={{ sx: { width: 260 } }}>
            <Box sx={{ width: 260, p: 2 }} role="presentation" onClick={() => setNavOpen(false)}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Menu</Typography>
              <Divider sx={{ mb: 1 }} />
              <List>
                {navItems.map(n => (
                  <ListItem key={n.to} component={NavLink} to={n.to} button>
                    <ListItemText primary={n.label} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
    </AppBar>
  )
}
