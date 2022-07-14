const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user_Id :{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    products:[{
        pro_Id:{type:mongoose.Schema.Types.ObjectId,
        ref:'product'},
        Price:{type:Number},
        quantity:{type:Number,default:1},
        subTotal:{type:Number,default:0},
        productName:{type:String}
    }],
    
})
const cart = mongoose.model('cart',cartSchema)
module.exports=cart