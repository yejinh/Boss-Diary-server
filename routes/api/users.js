const router = require('express').Router();
const { ensureLoggedIn } = require('./middlewares/authentication');
const { uploadS3 } = require('./middlewares/uploadS3');
const userController = require('./controllers/user.controller');

router.get('/:user_id', ensureLoggedIn, userController.getOne);
router.get('/:user_id/reports', ensureLoggedIn, userController.getAllReports);
router.get('/:user_id/reports/page', ensureLoggedIn, userController.getPaginationReports);
router.get('/:user_id/templates', ensureLoggedIn, userController.getUserTemplates);
router.post('/:user_id/reports', ensureLoggedIn, uploadS3, userController.create);
router.put('/:user_id', ensureLoggedIn, userController.addTemplate);

module.exports = router;
