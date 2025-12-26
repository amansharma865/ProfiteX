const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');
const authorize = require('../middlewares/authorize')

router.post("/register",userController.register);
router.post("/sign-in",userController.loginUser);
router.get("/logout",authorize.verifyJwtUser,userController.logoutUser);
router.post("/update-details",authorize.verifyJwtUser,userController.updateUserDetails);
router.get("/get-details",authorize.verifyJwtUser,userController.getDetails);
router.get("/admin-details",authorize.verifyJwtUser,userController.getAdmin);
router.get('/daily-salees',authorize.verifyJwtUser,userController.getDailySalees);
router.get('/weekly-revenue',authorize.verifyJwtUser,userController.getWeeklyRevenue);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post(
    "/upload-profile-pic",
    authorize.verifyJwtUser,
    userController.uploadProfilePic);
module.exports = router;