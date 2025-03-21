const express = require('express');
const router = express.Router();
const sintomasController = require('../controllers/sintomasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', sintomasController.registrarSintoma);
router.get('/', sintomasController.listarSintomas);
router.get('/:id', sintomasController.obterSintomaPorId);
router.put('/:id', sintomasController.atualizarSintoma);  // Editar Sintoma
router.delete('/:id', sintomasController.deletarSintoma);  // Excluir Sintoma

router.patch('/:id/status', sintomasController.atualizarStatusSintoma);

// ✅ Apenas um `module.exports`
module.exports = router;
