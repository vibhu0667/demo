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
 mobile:{
    type:Number,  //10 digits only
    minlength:10,
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