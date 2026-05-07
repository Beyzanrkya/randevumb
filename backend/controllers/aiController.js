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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    ];

    let lastError = null;

    for (const url of urls) {
      try {
        let contents = [];
        
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
          3. Cevapların her zaman TAM VE EKSİKSİZ cümlelerden oluşsun. Asla cümleyi yarım bırakma.
          4. Nazik ve profesyonel bir üslup kullan.
          5. Markdown formatını (kalın yazı, linkler vb.) kullan.
          6. Bilmediğin işletmeler hakkında uydurma bilgi verme, sadece sistemdekileri söyle.
        `;

        if (history && history.length > 0) {
          contents = history
            .filter(h => h.text && h.text.trim() !== "")
            .map(h => ({
              role: h.sender === "ai" ? "model" : "user",
              parts: [{ text: h.text }]
            }));
        }

        // Mevcut mesajı ve sistem talimatını ekle
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
        console.error(`URL denemesi başarısız (${url}):`, err.response?.data?.error?.message || err.message);
        lastError = err;
      }
    }

    throw lastError;

  } catch (error) {
    console.error("AI Chat Final Error:", error.response?.data || error.message);
    res.status(500).json({ 
      aiResponse: "Şu an cevap veremiyorum, lütfen API anahtarınızı kontrol edin veya biraz bekleyin. 😊" 
    });
  }
};
