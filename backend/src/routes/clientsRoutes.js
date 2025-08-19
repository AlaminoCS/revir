const express = require('express')
const router = express.Router()
const clientsController = require('../controllers/clientsController')
const { requireAuth } = require('../middleware/authMiddleware')

router.get('/', requireAuth, clientsController.list)
router.get('/:id', requireAuth, clientsController.get)
router.get('/by-cpf/:cpf', requireAuth, clientsController.getByCpf)
router.post('/', requireAuth, clientsController.create)
router.put('/:id', requireAuth, clientsController.update)
router.delete('/:id', requireAuth, clientsController.remove)

module.exports = router
