const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn , isOwner  } = require("../middleware.js");

// ✅ Middleware to validate listing
function validateListing(req, res, next) {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}

// ======================= ROUTES ======================= //

// INDEX - show all listings
router.get("/", async (req, res) => {
  try {
    // Query all listings and explicitly ensure we return plain docs for the EJS loop.
    const allListings = await Listing.find({}).lean().maxTimeMS(5000);
    console.log(`✅ Route /listings - Found ${allListings.length} listings`);
    return res.render("listings/index", { listings: allListings });
  } catch (err) {
    console.error("/listings index error:", err);
    return res.status(500).render("listings/error.ejs", { message: "Failed to load listings" });
  }
});

// NEW - show form to create listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE - add new listing
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // ✅ associate logged-in user
    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings/${newListing._id}`);
  })
);

// EDIT - show form to edit listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) throw new ExpressError(404, "Listing Not Found");
    res.render("listings/edit.ejs", { listing });
  })
);

// UPDATE - update a listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      throw new ExpressError(404, "Listing Not Found");
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${updatedListing._id}`);
  })
);

// DELETE - delete a listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) throw new ExpressError(404, "Listing Not Found");
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  })
);

// SHOW - show one listing (⚠️ keep this LAST)
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner"); // ✅ include owner
    if (!listing) throw new ExpressError(404, "Listing Not Found");
    res.render("listings/show.ejs", { listing });
  })
);

module.exports = router;
