const mongoose = require('mongoose');
require('dotenv').config();

const BusinessOwner = require('./models/BusinessOwner');
const Business = require('./models/Business');

const cleanup = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for cleanup...");

    // Delete businesses with the specific test domain
    const businessResult = await Business.deleteMany({ email: { $regex: /@mbrandev\.com$/ } });
    console.log(`Deleted ${businessResult.deletedCount} businesses.`);

    // Delete owners with the specific test domain
    const ownerResult = await BusinessOwner.deleteMany({ email: { $regex: /@mbrandev\.com$/ } });
    console.log(`Deleted ${ownerResult.deletedCount} business owners.`);

    console.log("Cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup error:", error);
    process.exit(1);
  }
};

cleanup();
