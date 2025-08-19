const express = require('express')
const router = express.Router()
const purchasesController = require('../controllers/purchasesController')
const { requireAuth } = require('../middleware/authMiddleware')

router.get('/', requireAuth, purchasesController.list)
router.get('/:id', requireAuth, purchasesController.get)
router.post('/', requireAuth, purchasesController.create)
router.put('/:id', requireAuth, purchasesController.update)
router.delete('/:id', requireAuth, purchasesController.remove)

module.exports = router
