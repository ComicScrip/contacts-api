const router = require('express').Router();
const customersController = require('../controllers/customer.controller.js');
const protectByApiKey = require('../middlewares/protectByEnvAPIKey');

router.post('/', protectByApiKey, customersController.create);
router.get('/', customersController.findAll);
router.get('/:id', customersController.findOne);
router.put('/:id', protectByApiKey, customersController.update);
router.delete('/:id', protectByApiKey, customersController.delete);

module.exports = router;
