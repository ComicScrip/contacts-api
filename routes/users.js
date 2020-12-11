const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const usersController = require('../controllers/users.js');
const protectByApiKey = require('../middlewares/protectByEnvAPIKey');
const requireRequestBody = require('../middlewares/requireRequestBody.js');

router.post(
  '/',
  protectByApiKey,
  requireRequestBody,
  asyncHandler(usersController.handlePost)
);
router.get('/', asyncHandler(usersController.getCollection));
router.get('/:id', asyncHandler(usersController.findOne));
router.put(
  '/:id',
  requireRequestBody,
  protectByApiKey,
  asyncHandler(usersController.update)
);
router.delete('/:id', protectByApiKey, asyncHandler(usersController.delete));

module.exports = router;
