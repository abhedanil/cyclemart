const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const CarouselSchema= new Schema({
    CarouselHeading:String,
    Sub_heading:String,
    Image:String,
})
const Carousel=mongoose.model('Carousel',CarouselSchema)
module.exports=Carousel