const axios = require("axios");
const Business = require("../models/Business");
const Category = require("../models/Category");

exports.chatWithAI = async (req, res) => {
  try {
    const { message, history, userType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ aiResponse: "API Key eksik. 😊" });
    }

    // Sistemdeki verileri çekiyoruz (AI'ya öğretmek için)
    const [businesses, categories] = await Promise.all([
        Business.find().populate("categoryId", "name").limit(10), // Performans için limitli
        Category.find()
    ]);

    const businessContext = businesses.map(b => 
        `- ${b.name} (${b.categoryId?.name || "Genel"}): ${b.address || "Adres belirtilmemiş"}`
    ).join("\n");

    const categoryContext = categories.map(c => c.name).join(", ");

    // Kullanıcı tipine göre doğru randevu linkini belirliyoruz
    const appointmentsPath = userType === "customer" ? "/customer-appointments" : "/appointments";

    const urls = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        let contents = [];
        
        // Geçmişi temizle ve düzenle (Boş mesajları ve ardışık aynı rolleri engelle)
        if (history && history.length > 0) {
          let lastRole = null;
          history.forEach(h => {
            if (h.text && h.text.trim() !== "") {
              const currentRole = h.sender === "ai" ? "model" : "user";
              if (currentRole !== lastRole) {
                contents.push({
                  role: currentRole,
                  parts: [{ text: h.text }]
                });
                lastRole = currentRole;
              }
            }
          });
        }

        // Eğer son mesaj user ise araya model mesajı eklemek gerekir veya birleştirmek gerekir.
        // Ancak bizim akışımızda en son biz user olarak ekleme yapıyoruz.
        if (contents.length > 0 && contents[contents.length - 1].role === "user") {
           // Son mesaj user ise, yeni mesajı ona eklemek yerine sistem talimatıyla birleştiriyoruz.
        }

        // Sistem Talimatı (Context)
        const systemInstruction = `
          Sen MBrandev platformunun resmi AI asistanısın. Görevin kullanıcılara yardımcı olmak ve onları yönlendirmektir.
          
          PLATFORM BİLGİLERİ:
          - Kullanıcı Tipi: ${userType === "customer" ? "Müşteri" : "İşletme Sahibi"}.
          - Randevular Sayfası: [Randevularım](${appointmentsPath})
          - Desteklenen Kategoriler: ${categoryContext}
          
          SİSTEMDEKİ BAZI AKTİF İŞLETMELER:
          ${businessContext}

          KURALLAR:
          1. Eğer kullanıcı bir hizmet arıyorsa yukarıdaki işletmelerden uygun olanı öner.
          2. Randevu sorduysa mutlaka randevular sayfası linkini ver.
          3. Cevapların her zaman TAM VE EKSİKSİZ cümlelerden oluşsun.
          4. Nazik ve profesyonel bir üslup kullan.
          5. Markdown formatını kullan.
        `;

        contents.push({
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nKullanıcı Sorusu: ${message}` }]
        });

        const response = await axios.post(url, {
          contents: contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        }, {
          headers: { "Content-Type": "application/json" }
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
          const aiText = response.data.candidates[0].content.parts[0].text;
          return res.status(200).json({ aiResponse: aiText });
        }
      } catch (err) {
        lastError = err;
        console.error(`Denenen model hatası (${url}):`, err.response?.data || err.message);
      }
    }

    throw lastError;

  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error("AI Chat Final Error:", errorDetails);
    res.status(500).json({ 
      aiResponse: `Üzgünüm, şu an bağlantı kurulamadı. (Hata: ${errorDetails}). Lütfen API anahtarını Vercel'den kontrol edip tekrar deneyin. 😊` 
    });
  }
};
