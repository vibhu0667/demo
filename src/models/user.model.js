const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
 name:{
    type:String,
    trim:true,
 }, 
 email:{
    type:String,
 },

 password:{
    type:String,
 },

role:{
   type:String,
   enum:['user','admin']
 },
 mobile: {
   type: Number,
   required: true,
   unique: true,
   validate: {
     validator: function (v) {
       return /^[0-9]{10}$/.test(v.toString()); // Ensures exactly 10 digits
     },
     message: (props) => `${props.value} is not a valid 10-digit mobile number!`,
   },
 },
 isdeleted:{
   type: Boolean,
   default : false
 },
 createdAt:{
   type: Date,
   default: Date.now
},
},{
    timeStamp:true,
    versionKey:false,
}

)
const User=mongoose.model('user',userSchema);
module.exports = User;  