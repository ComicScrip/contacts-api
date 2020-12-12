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
router.get('/', asyncHandler(usersController.handleGetMany));
router.get('/:id', asyncHandler(usersController.handleGetOne));
router.put(
  '/:id',
  requireRequestBody,
  protectByApiKey,
  asyncHandler(usersController.handlePatch)
);
router.delete(
  '/:id',
  protectByApiKey,
  asyncHandler(usersController.handleDeleteOne)
);

module.exports = router;
