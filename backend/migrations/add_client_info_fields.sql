-- Migration to add client_info_type and client_info_value fields to sales table
-- These fields will store flexible client information (name, cpf, email, phone)

ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS client_info_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS client_info_value TEXT;

-- Add comments for documentation
COMMENT ON COLUMN sales.client_info_type IS 'Type of client information: nome, cpf, email, telefone';
COMMENT ON COLUMN sales.client_info_value IS 'Value of the client information based on the type';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_client_info_type ON sales(client_info_type);
CREATE INDEX IF NOT EXISTS idx_sales_client_info_value ON sales(client_info_value);
