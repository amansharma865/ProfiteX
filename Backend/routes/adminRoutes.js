const express = require('express');
const router = express.Router();
const { register, getUsers, updateUser, deleteUser, sendMessage, sendWhatsapp,loginAdmin,logoutAdmin, createUser, getAllUsersUnderAdmin, updateUserStatus,getUserCount,completeProfile,getTotalEarningsForAdmin,getDailySalesForAdmin,getAdminWeeklyRevenue, forgotPassword, resetPassword,uploadProfilePic } = require('../controllers/adminController');
const authorize = require('../middlewares/authorize')
router.post('/register', register);
router.post('/login',loginAdmin);
router.get('/logout',authorize.verifyJwtAdmin,logoutAdmin)
router.post('/create-user',authorize.verifyJwtAdmin,createUser)
router.get('/get-details',authorize.verifyJwtAdmin,getUsers)
router.get('/getAllUsers',authorize.verifyJwtAdmin,getAllUsersUnderAdmin)
router.put('/update-status',authorize.verifyJwtAdmin,updateUserStatus)
router.get('/user-count',authorize.verifyJwtAdmin,getUserCount);

router.post('/profile-complete',authorize.verifyJwtAdmin,completeProfile);
router.get('/get-earnings',authorize.verifyJwtAdmin,getTotalEarningsForAdmin);
router.get('/get-daily-sales',authorize.verifyJwtAdmin,getDailySalesForAdmin);
router.get('/get-weekly-revenue',authorize.verifyJwtAdmin,getAdminWeeklyRevenue);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post(
    "/upload-profile-pic",
    authorize.verifyJwtAdmin,
    uploadProfilePic);


router.post('/send', sendMessage);
router.post('/whatsapp', sendWhatsapp);
router.get('/user-list', getUsers);
router.post('/update/:_id', updateUser);
router.post('/delete/:_id', deleteUser);

module.exports = router;
