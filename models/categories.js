const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const categorySchema =  new Schema({
    category:String,
    Images:{
        type:Array}
   
})    
const category = mongoose.model('category',categorySchema)
module.exports = category 