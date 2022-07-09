const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
    subcategory:String,
    category:{
        subcategory:String,
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
    }

})
const subcategory=mongoose.model('subcategory',subcategorySchema)

module.exports=subcategory