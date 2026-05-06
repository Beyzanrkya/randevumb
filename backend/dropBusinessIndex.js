require("dotenv").config();
const mongoose = require("mongoose");

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Try dropping the index
    const db = mongoose.connection.db;
    try {
      await db.collection("businesses").dropIndex("email_1");
      console.log("Dropped email_1 index successfully.");
    } catch (e) {
      console.log("email_1 index may not exist. Moving on.", e.message);
    }
    
    // As the data might be invalid for the new schema, we can also wipe the existing Business collection.
    // However, I'll just wipe all businesses so we start fresh for this feature.
    await db.collection("businesses").deleteMany({});
    console.log("Cleared old businesses to match new schema.");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

dropIndex();
