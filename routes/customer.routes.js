const router = require('express').Router();
const customersController = require('../controllers/customer.controller.js');

router.post('/', customersController.create);
router.get('/', customersController.findAll);
router.get('/:id', customersController.findOne);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.delete);

module.exports = router;
