const mongoose = require("mongoose")
const Schema = mongoose.Schema

const productSchema =new Schema({
    productName:{type:String, required:true},
    Price:{type:String, required:true},
    discount :Number,
    stock:Number,
    brandname:String,
  
    description :{type:String, required:true},
    
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required:true
    },
    subcategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"subcategory"
    },

    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"brand",
        required:true
    },
    Images:{
        type:Array
    },
    created_at: {type:Date,required:true,default:Date.now}
},{ timestamp:true})

const products = mongoose.model('product',productSchema)
module.exports= products