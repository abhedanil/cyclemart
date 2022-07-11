const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const brandSchema = new Schema({
    BrandName:String,
    
})
const brand = mongoose.model('brand',brandSchema)
module.exports=brand