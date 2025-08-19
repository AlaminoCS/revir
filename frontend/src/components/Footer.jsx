import React from 'react'
import { Box, Typography, IconButton, useTheme } from '@mui/material'
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material'
import { useThemeMode } from '../context/ThemeModeContext'

export function Footer() {
  const { mode, toggle } = useThemeMode()
  const theme = useTheme()

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 2,
        px: 3,
        mt: 4,
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Revir — Todos os direitos reservados
      </Typography>
      {/* <Box>
        <IconButton onClick={toggle} color="inherit" size="large" aria-label="Alternar tema">
          {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
        </IconButton>
      </Box> */}
    </Box>
  )
}

export default Footer
