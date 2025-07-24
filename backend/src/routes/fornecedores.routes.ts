import { Router } from 'express'
import {
  createFornecedor,
  listFornecedores,
  getFornecedorById,
  updateFornecedor,
  deleteFornecedor
} from '../controllers/fornecedores.controller'

const router = Router()

router.post('/fornecedores', createFornecedor)
router.get('/fornecedores', listFornecedores)
router.get('/fornecedores/:id', getFornecedorById)
router.put('/fornecedores/:id', updateFornecedor)
router.delete('/fornecedores/:id', deleteFornecedor)

export default router
