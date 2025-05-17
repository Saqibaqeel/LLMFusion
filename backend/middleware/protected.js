const jwt = require('jsonwebtoken');;
const User=require('../models/userModel');


const protected=async(req,res,next)=>{
    const token=req.cookies.jwt;
    if(!token){
        return res.status(401).json({msg:'Unauthorized'});
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded){
        return res.status(401).json({msg:'Unauthorized'});
    }
    const user=await User.findById(decoded.id).select('-password');
    if(!user){
        return res.status(401).json({msg:'Unauthorized'});
    }
    req.user=user;
    next();

}
module.exports=protected; 