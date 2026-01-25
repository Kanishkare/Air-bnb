const mongoose = require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");
const { not } = require("joi");

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
    initdata.data = initdata.data.map((obj) => {
  return { 
    ...obj, 
    owner: '68b8ef9b69bd91980dfa48c4'
  };
});

    await Listing.insertMany(initdata.data);
    console.log("data was initialised");
};
initdb();