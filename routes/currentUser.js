const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const currentUserController = require('../controllers/currentUser.js');
const requireCurrentUser = require('../middlewares/requireCurrentUser.js');

router.get(
  '/',
  requireCurrentUser,
  asyncHandler(currentUserController.handleGetProfile)
);

module.exports = router;
