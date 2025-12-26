const express = require('express');
const inventoryBranchController = require('../controllers/inventoryBranchController');
const authorize = require('../middlewares/authorize')
const router = express.Router();

router.post('/add-inventory',authorize.verifyJwtUser ,inventoryBranchController.addInventoryBranch);
router.get('/get-inventory',authorize.verifyJwtUser, inventoryBranchController.getInventoryBranches);
router.get('/:branch_id', inventoryBranchController.getItemsUnderBranch);
router.delete('/:inventoryBranch_id', inventoryBranchController.deleteInventoryBranch);

module.exports = router;
