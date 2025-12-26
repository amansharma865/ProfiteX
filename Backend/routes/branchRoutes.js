const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// router.post('/create-branch', branchController.createBranch);
// router.get('/get-branches', branchController.getBranches);
// router.get('/get-branchid/:id', branchController.getBranchById);
// router.put('/update-branch/:id', branchController.updateBranch);
// // Shift inventory items to another inventory branch when inventory branch type changes
// router.put('/:id/shift-inventory', branchController.shiftInventoryItems);
// router.delete('/:id/delete-branch', branchController.deleteBranch);

module.exports = router;
