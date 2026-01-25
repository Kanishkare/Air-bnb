const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// =================== DATABASE =================== //
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/airbnb";
mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB connection error:", err));

// =================== MIDDLEWARE =================== //
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ========== SESSION + FLASH ========== //
const sessionConfig = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// ========== PASSPORT AUTH ========== //
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ========== GLOBAL VARIABLES ========== //
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// =================== ROUTES =================== //
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/", userRouter);                       // Authentication
app.use("/listings", listingRouter);           // Listings
app.use("/listings/:id/reviews", reviewRouter);// Reviews nested under listings

// =================== 404 CATCH-ALL =================== //
// Use app.use without a path to catch all unmatched routes. This
// avoids passing the '*' pattern into the path-to-regexp parser,
// which can throw when certain versions treat '*' as a parameter.
app.use((req, res, next) => {
  res.status(404).render("listings/error.ejs", { message: "Page Not Found" });
});

// =================== GLOBAL ERROR HANDLER =================== //
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});

// =================== START SERVER =================== //
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
