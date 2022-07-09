const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const brandSchema = new Schema({
    user_id : {}
})
const brand = mongoose.model('brand',brandSchema)
module.exports=brand