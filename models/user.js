const mongoose=require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
    type:String,
    required:true
    },
    password:{
        type:String,
        required:true
    },
    block:{
            type:Boolean
    },
    address:[{
        fname:String,
        lname:String,
        house:String,
        towncity:String,
        district:String,
        state:String,
        pincode:String,
        email:String,
        mobile:String,
        locality: String
    }]
})

const User=mongoose.model('user',UserSchema)
module.exports=User
