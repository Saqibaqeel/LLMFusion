const mongoose = require('mongoose');

// Connect to MongoDB
const connectDb=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log('MongoDB connected...');
        
    } catch (err) {
      console.log('error while connecting to MongoDB',err);
       
        
    }

}
module.exports = {connectDb}; // export the function to use it in the index.js file