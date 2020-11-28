const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const contactsController = require('../controllers/contacts.js');
const protectByApiKey = require('../middlewares/protectByEnvAPIKey');

router.post('/', protectByApiKey, asyncHandler(contactsController.create));
router.get('/', asyncHandler(contactsController.findAll));
router.get('/:id', asyncHandler(contactsController.findOne));
router.put('/:id', protectByApiKey, asyncHandler(contactsController.update));
router.delete('/:id', protectByApiKey, asyncHandler(contactsController.delete));

module.exports = router;
