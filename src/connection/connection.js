const mongoose=require('mongoose')

const  createDb=async()=>{
    mongoose.connect('mongodb://localhost:27017/book').then((data)=>{
        console.log('database is done with well connectivity ')
    }).catch((error)=>{
        console.log('fail')
    })
}

module.exports={createDb}