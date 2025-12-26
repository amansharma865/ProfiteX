const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authorize = require('../middlewares/authorize');

router.post('/add-item',authorize.verifyJwtUser, inventoryController.addItem);
router.get('/:inventoryBranch_id',authorize.verifyJwtUser, inventoryController.getItemsByBranch);
router.put('/:id',authorize.verifyJwtUser, inventoryController.updateItem);
router.delete('/:id',authorize.verifyJwtUser, inventoryController.deleteItem);

module.exports = router;
