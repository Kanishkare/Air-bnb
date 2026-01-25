const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const{ listingSchema }=require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","You must be signed in first!");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next)=>{
    const {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error","You do not have permission to do that");
        return res.redirect(`/listings/${id}`);
    }
    next();
}