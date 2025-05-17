const router = require('express').Router();
const protected=require('../middleware/protected')

const {signUp,login,logout,updateProfilePic,check}=require('../controllers/authController');


router.post('/signUp', signUp);
router.post('/login', login);
router.get('/logout', logout);


router.get('/check',protected,check)



module.exports=router;