const express = require('express');
const router = express.Router();
const sintomasController = require('../controllers/sintomasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', sintomasController.registrarSintoma);
router.get('/', sintomasController.listarSintomas);
router.get('/:id', sintomasController.obterSintomaPorId);

router.patch('/:id/status', sintomasController.atualizarStatusSintoma);

module.exports = router; 