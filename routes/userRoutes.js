const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/pacientes', userController.getUsers);
router.get('/pacientes/:id', userController.getUserById); 
router.put('/pacientes/:id', userController.updateUser); 
router.delete('/pacientes/:id', userController.deleteUser); 

module.exports = router;