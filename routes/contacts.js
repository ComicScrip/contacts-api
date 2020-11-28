const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const contactsController = require('../controllers/contacts.js');
const protectByApiKey = require('../middlewares/protectByEnvAPIKey');
const requireRequestBody = require('../middlewares/requireRequestBody.js');

router.post(
  '/',
  protectByApiKey,
  requireRequestBody,
  asyncHandler(contactsController.handlePost)
);
router.get('/', asyncHandler(contactsController.getCollection));
router.get('/:id', asyncHandler(contactsController.findOne));
router.put(
  '/:id',
  requireRequestBody,
  protectByApiKey,
  asyncHandler(contactsController.update)
);
router.delete('/:id', protectByApiKey, asyncHandler(contactsController.delete));

module.exports = router;
