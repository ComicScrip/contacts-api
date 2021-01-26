const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const contactsController = require('../controllers/contacts.js');
const requireRequestBody = require('../middlewares/requireRequestBody.js');

router.post(
  '/',
  requireRequestBody,
  asyncHandler(contactsController.handlePost)
);
router.get('/', asyncHandler(contactsController.getCollection));
router.get('/:id', asyncHandler(contactsController.findOne));
router.put('/:id', requireRequestBody, asyncHandler(contactsController.update));
router.delete('/:id', asyncHandler(contactsController.delete));

module.exports = router;
