const express = require('express');
const productController = require('../controllers/productController');
const authorize = require('../middlewares/authorize');
const router = express.Router();

router.post('/create', authorize.verifyJwtUser, productController.createProduct);
router.get('/getall', authorize.verifyJwtUser, productController.getAllProducts);
router.put('/update/:product_id', authorize.verifyJwtUser, productController.updateProduct);

router.delete('/delete/:product_id', authorize.verifyJwtUser, productController.deleteProduct);
router.post('/upload-excel', authorize.verifyJwtUser, productController.uploadExcel);

router.get('/total-stocks', authorize.verifyJwtUser, productController.getTotalStocksOfUser);
router.get('/count-out-of-stock', authorize.verifyJwtUser, productController.countOutOfStockProducts);

module.exports = router;
