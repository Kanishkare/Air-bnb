- [ ] Verify MongoDB connection string (MONGO_URL) is correct and points to the DB containing the 29 listings
- [ ] Restart server and load GET /listings
- [ ] Confirm console log shows 29 listings
- [ ] If still timing out: increase Mongo/Mongoose timeouts and check serverSelection/connectTimeout
- [ ] If listings render but are empty: check EJS and ensure listings variable is passed
- [x] Add maxTimeMS(5000) + improved error handling to routes/listing.js index route

