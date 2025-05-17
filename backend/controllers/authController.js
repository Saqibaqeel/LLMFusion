const User = require('../models/userModel');
const bcrypt = require('bcrypt'); // Fixed spelling
const generateToken = require('../utility/generateToken');

const signUp = async (req, res) => { // Added req, res parameters
    try {
        const { fullName, email, password } = req.body;

        // Check if all fields are provided
        if (!email || !password || !fullName) {
            return res.status(400).json({ msg: 'Please fill all the fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ fullName, email, password: hashedPassword });
        await newUser.save(); // Save user before generating token

        // Generate JWT token
        generateToken(newUser._id, res);

        // Respond with user data
        res.status(201).json({
            msg: 'User registered successfully',
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({msg:'Please fill all the fields'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({msg:'User not found'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({msg:'Invalid credentials'});
        }
        generateToken(user._id, res);
        res.status(200).json({
            msg:'User logged in successfully',
            user:{
                id:user._id,
                fullName:user.fullName,
                email:user.email,
                profilePic:user.profilePic
            }
        });
        
    } catch (error) {
        console.log('error while login', error);
        
    }
}
const logout=(req,res)=>{
    res.clearCookie('jwt');
    res.status(200).json({msg:'User logged out successfully'});
}
const updateProfilePic = async (req, res) => {
    try {
      console.log("Received File:", req.file); // Debugging
  
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded. Ensure the key is 'profilePic'." });
      }
  
      const profilePicPath = req.file.path;
      const userId = req.user._id;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      user.profilePic = profilePicPath;
      await user.save();
  
      res.status(200).json({
        msg: "Profile picture updated successfully",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic,
        },
      });
    } catch (error) {
      console.error("Error while updating profile picture:", error);
      res.status(500).json({ msg: "Server Error" });
    }
  };
  const check=(req,res)=>{
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ msg: "Unauthorized" });
        }
        res.status(200).json({ msg: "User authenticated", user });
    } catch (error) {
        console.error("Error while checking authentication:", error);
        res.status(500).json({ msg: "Server Error" });
    }
  }
  


module.exports={signUp,login,logout,updateProfilePic,check}; 