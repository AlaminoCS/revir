const express = require('express')
const router = express.Router()
const productsController = require('../controllers/productsController')
const { requireAuth } = require('../middleware/authMiddleware')

router.get('/', productsController.getProducts)
router.get('/:id', productsController.getProduct)
router.post('/', requireAuth, productsController.createProduct)
router.put('/:id', requireAuth, productsController.updateProduct)
router.delete('/:id', requireAuth, productsController.removeProduct)

// protected example
router.get('/secure', requireAuth, productsController.getProducts)

module.exports = router
