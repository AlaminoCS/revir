import { createTheme } from '@mui/material/styles'

export function buildTheme(scale = 1, mode = 'light') {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: isDark ? { main: '#90CAF9', contrastText: '#0B1220' } : { main: '#1A73E8', contrastText: '#FFFFFF' },
      secondary: isDark ? { main: '#FF8A80' } : { main: '#FF5252' },
      background: isDark ? { default: '#0B1220', paper: '#0E1724' } : { default: '#F8FAFF', paper: '#FFFFFF' },
      text: isDark ? { primary: '#E6EEF5', secondary: '#B9C7D6' } : { primary: '#1A1A2E', secondary: '#44566B' },
      info: isDark ? { main: '#102739' } : { main: '#E8F0FE', contrastText: '#e5e913ff' },
    },
    typography: {
      fontFamily: "'Google Sans', 'Roboto', sans-serif",
      htmlFontSize: 16,
      fontSize: 16 * scale,
      h1: { fontSize: `${36 * scale}px`, fontWeight: 700 },
      h2: { fontSize: `${28 * scale}px`, fontWeight: 700 },
      h3: { fontSize: `${22 * scale}px`, fontWeight: 600 },
      h4: { fontSize: `${18 * scale}px`, fontWeight: 600 },
      h5: { fontSize: `${16 * scale}px`, fontWeight: 500 },
      body1: { fontSize: `${16 * scale}px` },
      body2: { fontSize: `${14 * scale}px`, color: '#44566B' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
              '&:hover': { boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.6)' : '0 4px 12px rgba(26, 115, 232, 0.2)' }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
              boxShadow: isDark ? '0 8px 24px rgba(2,6,23,0.6)' : '0 6px 18px rgba(2,6,23,0.06)',
              backgroundColor: isDark ? '#0E1724' : '#FFFFFF'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
              backgroundColor: isDark ? '#0B1220' : '#FFFFFF',
              boxShadow: isDark ? '0 8px 24px rgba(2,6,23,0.6)' : '0 6px 18px rgba(2,6,23,0.06)'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
              backgroundColor: isDark ? '#071021' : '#FFFFFF',
              color: isDark ? '#E6EEF5' : '#1A1A2E',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.05)',
          }
        }
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
              backgroundColor: isDark ? '#90CAF9' : '#1A73E8',
              color: isDark ? '#0B1220' : '#FFFFFF',
          }
        }
      }
    },
    spacing: 8,
  })
}


