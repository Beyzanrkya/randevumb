require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log("Databases:", dbs.databases.map(d => d.name));
  
  // Also list collections in current DB
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections in current DB (" + mongoose.connection.db.databaseName + "):", collections.map(c => c.name));
  
  process.exit(0);
});
