const express = require('express')
const router = express.Router()
const salesController = require('../controllers/salesController')
const { requireAuth } = require('../middleware/authMiddleware')

router.get('/', requireAuth, salesController.getSales)
router.post('/', requireAuth, salesController.registerSale)

module.exports = router
