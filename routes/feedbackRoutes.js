const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.patch('/:id/status', feedbackController.atualizarStatusFeedback);

router.get('/debug/all', feedbackController.debugFeedbacks);

router.post('/', feedbackController.adicionarFeedback);
router.get('/', feedbackController.obterFeedbacks);
router.get('/:id', feedbackController.obterFeedbackPorId);
router.put('/:id', feedbackController.atualizarFeedback);
router.delete('/:id', feedbackController.deletarFeedback);

module.exports = router;
