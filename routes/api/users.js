const router = require('express').Router();
const { ensureLoggedIn } = require('./middlewares/authentication');
const { uploadS3 } = require('./middlewares/uploadS3');
const userController = require('./controllers/user.controller');

router.get('/:user_id', ensureLoggedIn, userController.getOne);
router.put('/:user_id', ensureLoggedIn, userController.update);
router.get('/:user_id/templates', ensureLoggedIn, userController.getUserTemplates);
router.post('/:user_id/reports', ensureLoggedIn, uploadS3, userController.create);

module.exports = router;
