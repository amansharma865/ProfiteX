const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize')
const {minValAndSizeForUser,getDetails, minValAndSizeForAdmin, getDetailsForAdmin} = require('../controllers/warehouseController')
router.post('/enter-details',authorize.verifyJwtUser,minValAndSizeForUser);
router.get('/get-details',authorize.verifyJwtUser,getDetails);
router.post('/enter-details-admin',authorize.verifyJwtAdmin,minValAndSizeForAdmin);
router.get('/get-details-admin',authorize.verifyJwtAdmin,getDetailsForAdmin);

module.exports = router;