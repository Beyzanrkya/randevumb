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
const notificationRoutes = require("./routes/notifications");
const aiRoutes = require("./routes/ai");
const reviewRoutes = require("./routes/reviews");
const loyaltyRoutes = require("./routes/loyalty");

const app = express();

// Gelen her isteği terminale yazdır (Debug için)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// CORS Ayarları
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Cached connection - Vercel Serverless yapısı için kritik
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    // strictQuery uyarısını kapatmak için (isteğe bağlı)
    mongoose.set('strictQuery', true); 
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB bağlandı");
  } catch (error) {
    console.error("MongoDB ilk bağlantı hatası:", error);
    throw error;
  }
};

// ✅ Her istekten önce veritabanı bağlantısını sağla
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Veritabanı bağlantı hatası", error: err.message });
  }
});

// --- ROUTES ---

// Hem "/" hem de "/api" isteklerine cevap vererek 404 hatasını önlüyoruz
const statusHandler = (req, res) => {
  res.json({ 
    status: "success",
    message: "MBrandev API çalışıyor!", 
    version: "1.0.0",
    database: isConnected ? "connected" : "disconnected"
  });
};

app.get("/", statusHandler);
app.get("/api", statusHandler);

// Diğer route tanımlamaları
// Not: Vercel vercel.json'da /api/(.*) -> index.js yönlendirmesi yaptığı için
// bu route'lar hem /customers hem de /api/customers olarak erişilebilir olacaktır.

// Hem kök dizin hem de /api altından erişebilmek için:
const apiRouter = express.Router();
apiRouter.use("/customers", customerRoutes);
apiRouter.use("/services", serviceRoutes);
apiRouter.use("/businesses", businessRoutes);
apiRouter.use("/appointments", appointmentRoutes);
apiRouter.use("/comments", reviewRoutes); // Yorumları Reviews'a yönlendir
apiRouter.use("/reviews", reviewRoutes);  // Reviews zaten doğru
apiRouter.use("/categories", categoryRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/ai", aiRoutes);
apiRouter.use("/loyalty", loyaltyRoutes);

app.use("/api", apiRouter);

// Geriye dönük uyumluluk için doğrudan kullanımlar
app.use("/customers", customerRoutes);
app.use("/services", serviceRoutes);
app.use("/businesses", businessRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/comments", reviewRoutes); // Burayı da Reviews yapalım
app.use("/reviews", reviewRoutes);
app.use("/categories", categoryRoutes);
app.use("/notifications", notificationRoutes);
app.use("/loyalty", loyaltyRoutes);

// Hatalı route'lar için fallback
app.use((req, res) => {
  res.status(404).json({ message: "İstediğiniz sayfa bulunamadı (404)" });
});

// Vercel ortamı dışında çalışıyorsan (lokalde) sunucuyu başlat
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda aktif`);
  });
}

// Vercel için app nesnesini dışa aktar
module.exports = app;
