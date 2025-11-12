const mongoose=require("mongoose")

const carSchema=new mongoose.Schema({
    name:String,
    brand:String,
    price:Number,
    type:String,
    year:Number,
    fuelType:String,
    mileage:String,
    imageURL:String,
    location:String,
    description:String

},
{
    timestamps:true
}
)

module.exports=mongoose.model("Cars",carSchema)