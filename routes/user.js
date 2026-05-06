const express = require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup",async(req,res)=>{
    try{
        let {username,email,password}=req.body;
    const newUser = new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
         req.flash("success","Welcome to Chill n Go!");
         // Always redirect to the full listings page after signup.
         res.redirect("/listings");
    });

    }catch(e){
         req.flash("error",e.message);
         res.redirect("/signup");

    }


});

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",passport.authenticate("local",{failedRedirect: '/login',failureFlash:true}),async(req,res)=>{
    req.flash("success","welcome back!");
     // Always redirect to the full listings page after login.
     res.redirect("/listings");
})

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
      if(err){
        return next(err);
      }  
      req.flash("success","you are logged out now!");
      res.redirect("/listings");
    })
})
   


module.exports=router;