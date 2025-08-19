import { Box, Typography, Button, useTheme } from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

export function PromoBanner({text}) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        gap: 3,
        background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
        color: 'white',
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        height: '200px',      
        mx: 'auto',
        my: 4
      }}
    >
      {/* Título */}
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2rem' },
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {text}
      </Typography>
      
      
    </Box>
  );
}