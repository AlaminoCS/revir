require('dotenv').config() // Adicione esta linha no topo do arquivo
const { createClient } = require('@supabase/supabase-js')

console.log('Verificando variáveis de ambiente:')
console.log('URL:', process.env.SUPABASE_URL)
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 5) + '...') // Mostra só os primeiros caracteres por segurança

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('🚨 Supabase não configurado - verifique:')
  console.error('1. O arquivo .env está na raiz do projeto?')
  console.error('2. As variáveis têm exatamente os mesmos nomes?')
  console.error('3. Você instalou e configurou o pacote dotenv?')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: { headers: { 'x-my-app': 'revir-backend' } }
})

async function testConnection() {
  try {
    console.log('\nTestando conexão com Supabase...')
    const { data, error } = await supabase.from('clients').select('*').limit(1)
    
    if (error) {
      console.error('❌ Erro na consulta:', error)
      console.error('Sugestões:')
      console.error('- Verifique se a tabela "clients" existe')
      console.error('- Confira as permissões RLS no painel do Supabase')
      console.error('- Use a Service Role Key correta')
    } else {
      console.log('✅ Conexão bem-sucedida! Primeiro cliente:', data[0] || 'Nenhum dado encontrado')
    }
  } catch (err) {
    console.error('❌ Erro fatal:', err)
  }
}

testConnection()