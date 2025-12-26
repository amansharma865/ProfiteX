const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authorize = require('../middlewares/authorize');

router.post('/placeorder',authorize.verifyJwtUser, orderController.placeorder);
router.get('/getorder',authorize.verifyJwtUser, orderController.getOrder);
router.get('/checkOrder',authorize.verifyJwtAdmin, orderController.getOrderForAdmin);
router.get('/getorderbyid/:id', orderController.getOrderById);
router.put('/updateorder',authorize.verifyJwtAdmin, orderController.updateorder);
router.delete('/deleteorder/:id', orderController.deleteorder);
router.delete('/clear', orderController.clearOrders);
router.get('/countOrder-pending-admin',authorize.verifyJwtAdmin, orderController.countOrderForAdmin);
router.get('/countOrder-pending-user',authorize.verifyJwtUser, orderController.countOrderForUser);

router.get('/accept/:id/:token', orderController.acceptOrder);
router.get('/reject/:id/:token', orderController.rejectOrder);

module.exports = router;

