require("dotenv").config();

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

// =================== DATABASE =================== //

const MONGO_URL = process.env.MONGO_URL;

async function startServer() {
  try {
    if (!MONGO_URL) {
      throw new Error("Missing MONGO_URL in environment variables (.env or deployment settings)");
    }

    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected");



    // =================== MODELS =================== //
    const Listing = require("./models/listing");
    const Review = require("./models/review");
    const User = require("./models/user");

    // =================== ROUTES =================== //
    const listingRouter = require("./routes/listing");
    const reviewRouter = require("./routes/review");
    const userRouter = require("./routes/user");

    // =================== VIEW ENGINE =================== //
    app.engine("ejs", ejsMate);
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    // =================== MIDDLEWARE =================== //
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.use(express.static(path.join(__dirname, "public")));

    // =================== SESSION =================== //
    const sessionConfig = {
      secret: "mysupersecretcode",
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    };

    app.use(session(sessionConfig));
    app.use(flash());

    // =================== PASSPORT =================== //
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // =================== GLOBAL VARIABLES =================== //
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

    app.use("/", userRouter);
    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);

    // =================== 404 =================== //
    app.use((req, res) => {
      res.status(404).render("listings/error.ejs", {
        message: "Page Not Found",
      });
    });

    // =================== ERROR HANDLER =================== //
    app.use((err, req, res, next) => {
      const { statusCode = 500, message = "Something went wrong!" } = err;
      res.status(statusCode).render("listings/error.ejs", { message });
    });

    // =================== SERVER =================== //
    const PORT = 8080;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

startServer();