const router = require('express').Router();
const { ensureLoggedIn } = require('./middlewares/authentication');
const userController = require('./controllers/user.controller');

router.get('/:user_id', ensureLoggedIn, userController.getOne);
router.put('/:user_id', ensureLoggedIn, userController.update);
router.get('/:user_id/templates', ensureLoggedIn, userController.getUserTemplates);
router.post('/:user_id/reports', ensureLoggedIn, userController.create);

module.exports = router;
