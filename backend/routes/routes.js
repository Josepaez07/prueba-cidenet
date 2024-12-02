const express = require('express');
const router = express.Router();
const controllerUsers = require('../controllers/users.controller')
const userModel = require('../models/users.models')

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/users', controllerUsers.listUsers);
router.post('/users', controllerUsers.createUsers);
router.post('/users/:id/delete', controllerUsers.deleteUser);
router.get('/users/:id/edit', controllerUsers.formEdit);
router.post('/users/:id/edit', controllerUsers.editUser);
router.get('/users/id/info', controllerUsers.viewUserInfo);

module.exports = router;
