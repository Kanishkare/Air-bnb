const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/airbnb";

main()
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.log("❌ Error connecting to MongoDB", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initdb = async () => {
  try {
    const count = await Listing.estimatedDocumentCount();
    if (count > 0) {
      console.log(`ℹ️ Seed skipped: Listing collection already has ${count} documents`);
      await mongoose.connection.close();
      return;
    }

    const sampleData = initdata.data.map((obj) => ({
      ...obj,
      owner: "68b8ef9b69bd91980dfa48c4",
    }));

    await Listing.insertMany(sampleData);

    console.log("✅ Database initialized");

    await mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
};

initdb();
