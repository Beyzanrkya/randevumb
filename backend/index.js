const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const businessRoutes = require("./routes/businesses");
const appointmentRoutes = require("./routes/appointments");
const commentRoutes = require("./routes/comments");
const categoryRoutes = require("./routes/categories");
const customerRoutes = require("./routes/customers");
const serviceRoutes = require("./routes/services");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());
app.use(express.json());

// ✅ Cached connection - Vercel için şart!
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("MongoDB bağlandı");
};

// ✅ Her istekten önce bağlantıyı kontrol et
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB bağlantı hatası:", err);
    res.status(500).json({ message: "Veritabanı bağlantı hatası" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "MBrandev API çalışıyor!", version: "1.0.0" });
});

app.use("/customers", customerRoutes);
app.use("/services", serviceRoutes);
app.use("/businesses", businessRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/comments", commentRoutes);
app.use("/categories", categoryRoutes);

// Vercel ortamında değilsek sunucuyu dinlemeye başla
if (require.main === module || process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
  });
}

module.exports = app;