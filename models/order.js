const mongoose = require("mongoose")
const orderSchema = new mongoose.Schema({
    user_Id :{type:mongoose.Schema.Types.ObjectId, 
            ref:"user"},
    paymentMethod: {type:String},
    Total:{type:Number,default:0},
    ShippingCharge:{type:Number},
    grandTotal:{type:Number,default:0},
    ordered_on:{type:Date},
    payment_status:{type:String},
    


    products:[{
        pro_Id:{type:mongoose.Schema.Types.ObjectId,
                ref:'product'
        },
        price:{type:Number},
        quantity:{type:Number,default:1},
        subTotal:{type:Number,default:0},
        status:{type:String,default:"order placed"},
        productName:{type:String},
        orderCancelled:{type:Boolean,default:false}
    }],

    deliveryDetails:
    {
        name:String,
        number:String,
        email:String,
        house:String,
        locality: String,
        city: String,
        district:String,
        state:String,
        state:String,
        country:String,
        pincode:Number
    },
    
})
const orderModel = mongoose.model("order",orderSchema)
module.exports = orderModel