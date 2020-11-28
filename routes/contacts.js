const router = require('express').Router();
const contactsController = require('../controllers/contacts.js');
const protectByApiKey = require('../middlewares/protectByEnvAPIKey');

router.post('/', protectByApiKey, contactsController.create);
router.get('/', contactsController.findAll);
router.get('/:id', contactsController.findOne);
router.put('/:id', protectByApiKey, contactsController.update);
router.delete('/:id', protectByApiKey, contactsController.delete);

module.exports = router;
