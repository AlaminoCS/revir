// Attempt to load .env for local development (safe - won't throw if dotenv isn't installed)
try { require('dotenv').config() } catch (e) { /* dotenv not installed; ignore */ }
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000


app.get('/', (req, res) => {
  res.json({message: 'Revir backend running', owner: 'Cleide'})
})

// seed mock DB password hash for the demo user if missing
const bcrypt = require('bcryptjs')
// Note: mockDb removed; backend now uses Supabase exclusively.
const authRoutes = require('./routes/authRoutes')
const productsRoutes = require('./routes/productsRoutes')
const clientsRoutes = require('./routes/clientsRoutes')
const suppliersRoutes = require('./routes/suppliersRoutes')
const purchasesRoutes = require('./routes/purchasesRoutes')
const salesRoutes = require('./routes/salesRoutes')

// For Supabase usage, create users using the SQL seed provided earlier or via Supabase UI.

app.use('/auth', authRoutes)
app.use('/products', productsRoutes)
app.use('/clients', clientsRoutes)
app.use('/suppliers', suppliersRoutes)
app.use('/purchases', purchasesRoutes)
app.use('/sales', salesRoutes)

app.listen(PORT, () => {
  console.log(`Revir backend listening on port ${PORT}`)
})
