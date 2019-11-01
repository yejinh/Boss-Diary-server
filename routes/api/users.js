const router = require('express').Router();
const { ensureLoggedIn } = require('./middlewares/authentication');
const userController = require('./controllers/user.controller');

router.get('/', ensureLoggedIn, userController.getOne);

module.exports = router;
