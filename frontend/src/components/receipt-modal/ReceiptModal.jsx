import React, { useRef, forwardRef } from 'react';
import { Modal, Box, Typography, Divider, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

// Componente auxiliar para linhas do recibo
const ReceiptRow = ({ label, value, prefix = '', variant = 'body2', bold = false, sx = {} }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', ...sx }}>
    <Typography variant={variant} fontWeight={bold ? 'bold' : 'normal'}>
      {label}
    </Typography>
    <Typography variant={variant} fontWeight={bold ? 'bold' : 'normal'}>
      {prefix} R$ {Number(value || 0).toFixed(2)}
    </Typography>
  </Box>
);

// Componente do conteúdo do recibo
const ReceiptContent = forwardRef(({ receiptData }, ref) => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR');
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div ref={ref}>
      <Box
        sx={{
          p: 3,
          width: '100mm',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          backgroundColor: 'white',
        }}
      >
        {/* Cabeçalho do recibo */}
        <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          REVIR
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
          CNPJ: 12.345.678/0001-99
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
          {formattedDate} - {formattedTime}
        </Typography>

        <Divider sx={{ my: 2, borderColor: 'text.primary', borderWidth: 1 }} />

        {/* Informações do Cliente */}
        {receiptData.clientName && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">CLIENTE:</Typography>
            <Typography variant="body1">{receiptData.clientName}</Typography>
            {receiptData.cpf && (
              <Typography variant="body2">CPF: {receiptData.cpf}</Typography>
            )}
          </Box>
        )}

        {/* Itens */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          ITENS:
        </Typography>
        {receiptData.items.map((it, index) => (
          <Box
            key={it.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 0.5,
              bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent',
              px: 1,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">
              {it.title} x{it.qty}
            </Typography>
            <Typography variant="body2">
              R$ {(Number(it.price) * Number(it.qty)).toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2, borderColor: 'text.primary', borderWidth: 1 }} />

        {/* Totais */}
        <ReceiptRow label="SUBTOTAL" value={receiptData.subtotal} />
        {receiptData.discount > 0 && (
          <ReceiptRow label="DESCONTO" value={-receiptData.discount} prefix="-" />
        )}
        <Divider sx={{ my: 1 }} />
        <ReceiptRow
          label="TOTAL"
          value={receiptData.total}
          variant="body1"
          bold
          sx={{ fontSize: '1.1rem' }}
        />

        {/* Forma de pagamento */}
        <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="body2">FORMA DE PAGAMENTO:</Typography>
          <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>
            {receiptData.paymentMethod}
          </Typography>
        </Box>

        {/* Rodapé */}
        <Typography variant="body2" align="center" sx={{ mt: 3, fontStyle: 'italic' }}>
          Obrigado pela preferência!
        </Typography>
      </Box>
    </div>
  );
});
ReceiptContent.displayName = 'ReceiptContent';

// Função auxiliar para formatar data/hora como nome de arquivo
const generateReceiptFilename = (date = new Date()) => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `recibo-revir-${year}-${month}-${day}-${hours}h-${minutes}m`;
};

export function ReceiptModal({ open, onClose, receiptData }) {
  const receiptRef = useRef();

  const handlePrint = () => {
    if (!receiptRef.current) return;

    const now = new Date();
    const filename = generateReceiptFilename(now); // Nome baseado na data do recibo

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir.');
      return;
    }

    const css = `
      @media print {
        @page {
          size: 80mm auto;
          margin: 5mm;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 10px;
          width: 80mm;
          box-sizing: border-box;
          margin: 0;
          background: white;
        }
      }
      body {
        margin: 0;
        background: #f5f5f5;
      }
    `;

    const content = receiptRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>${css}</style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close(); // Fecha após impressão
      }, 100);
    };
  };

  if (!receiptData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 0,
          width: 400,
          borderRadius: 1,
          maxWidth: '95vw',
          outline: 'none',
          maxHeight: '95vh',
          overflow: 'auto',
        }}
      >
        {/* Conteúdo do recibo */}
        <ReceiptContent ref={receiptRef} receiptData={receiptData} />

        {/* Botões de ação (não impressos) */}
        <Box
          className="no-print"
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 120 }}>
            Fechar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ minWidth: 120 }}
          >
            Imprimir
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}