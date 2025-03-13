const mongoose=require('mongoose')

const bookSchema=new mongoose.Schema({
 bname:{
    type:String,
    trim:true,
 },
 author:{
    type:String,
 },
createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
},
price:{
type:Number
},
totalstock:{
   type:Number,
},
quantity: {
   type: Number,
   default: 1,
 },
type:{
   type:String,
 },
 isdeleted:{
   type: Boolean,
 },
 image:{
   type:String
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
const Book=mongoose.model('book',bookSchema);
module.exports = Book;  