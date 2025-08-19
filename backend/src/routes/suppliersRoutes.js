const express = require('express')
const router = express.Router()
const suppliersController = require('../controllers/suppliersController')
const { requireAuth } = require('../middleware/authMiddleware')

router.get('/', requireAuth, suppliersController.list)
router.get('/:id', requireAuth, suppliersController.get)
router.post('/', requireAuth, suppliersController.create)
router.put('/:id', requireAuth, suppliersController.update)
router.delete('/:id', requireAuth, suppliersController.remove)

module.exports = router
