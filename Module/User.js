const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
   UserName: {
     type: String,
     required: true
   },
   Email: {
     type: String, 
     required: true,
     unique: true 
   },
   Password: {
     type: String, 
     required: true
   }
});

// Export the model
module.exports = mongoose.model("User", UserDetailsSchema);
