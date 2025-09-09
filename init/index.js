const mongoose = require("mongoose");
const data=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/airbnb";
main().then(()=>{
    console.log("Connected to MongoDB");
}).catch(err=>{
    console.log("Error connecting to MongoDB",err);
})
async function main(){
    //this url is from mongoose documentation
    await mongoose.connect(MONGO_URL);
}

const initdb= async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(data);
    console.log("data was initialised");
};
initdb();