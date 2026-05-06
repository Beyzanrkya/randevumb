const nodemailer = require('nodemailer');

exports.sendVerificationEmail = async (email, code) => {
  // Geliştirme kolaylığı: Kodu her zaman terminale de yazdır
  console.log(`\n========================================`);
  console.log(`📩 DOĞRULAMA KODU (Email: ${email}): ${code}`);
  console.log(`========================================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes("senin_epostan")) {
    console.log("⚠️ E-posta ayarları eksik veya varsayılan değerde kalmış. Kod sadece terminale yazdırıldı.");
    return { message: "Simulated mail sent" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Bağlantıyı test et
    console.log("🔍 E-posta sunucusuna bağlanılıyor...");
    try {
      await transporter.verify();
      console.log("✅ E-posta sunucusu hazır ve şifre doğru!");
    } catch (verifyError) {
      console.error("❌ E-posta bağlantı hatası (Şifre yanlış olabilir):", verifyError.message);
      throw new Error("E-posta sunucusuna bağlanılamadı. Lütfen .env dosyasındaki şifreyi kontrol edin.");
    }

    const mailOptions = {
      from: `"MBrandev Doğrulama" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'E-posta Doğrulama Kodu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #8E4A5D; text-align: center;">MBrandev'e Hoş Geldiniz!</h2>
          <p>Merhaba,</p>
          <p>Hesabınızı doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8E4A5D; border-radius: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Bu kod 30 dakika süreyle geçerlidir.</p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">© 2026 MBrandev Randevu Sistemi</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ E-posta başarıyla gönderildi:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ E-posta gönderim hatası:", error.message);
    throw error;
  }
};

exports.sendAppointmentEmail = async (email, details) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes("senin_epostan")) {
    console.log(`📩 Simüle Edilen Randevu Maili (${details.type}) -> ${email}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  let subject = "";
  let title = "";
  let message = "";
  let color = "#1E2A40";

  switch(details.type) {
    case 'new_to_business':
      subject = 'Yeni Randevu Talebi!';
      title = 'Yeni Bir Randevunuz Var';
      message = `Sayın işletme sahibi, <b>${details.customerName}</b> isimli müşteriniz <b>${details.date}</b> tarihinde saat <b>${details.time}</b> için bir randevu talebi oluşturdu.`;
      break;
    case 'status_update':
      subject = `Randevunuz Hakkında Güncelleme: ${details.statusText}`;
      title = `Randevu Durumu: ${details.statusText}`;
      message = `Sayın <b>${details.customerName}</b>, <b>${details.businessName}</b> işletmesindeki <b>${details.date}</b> tarihli randevunuz <b>${details.statusText}</b> olarak güncellendi.`;
      color = details.status === 'confirmed' ? '#16a34a' : '#ef4444';
      break;
  }

  const mailOptions = {
    from: `"MBrandev Bildirim" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: ${color}; text-align: center;">${title}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${color};">
          <p style="margin: 5px 0;"><b>İşletme:</b> ${details.businessName || 'MBrandev İşletmesi'}</p>
          <p style="margin: 5px 0;"><b>Tarih:</b> ${details.date}</p>
          <p style="margin: 5px 0;"><b>Saat:</b> ${details.time}</p>
          ${details.serviceName ? `<p style="margin: 5px 0;"><b>Hizmet:</b> ${details.serviceName}</p>` : ''}
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">Detaylar için MBrandev uygulamasına giriş yapabilirsiniz.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">© 2026 MBrandev Randevu Bildirim Sistemi</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Randevu maili gönderildi (${details.type}):`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Randevu maili gönderim hatası:", error.message);
  }
};

exports.sendRedemptionEmail = async (businessEmail, details) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes("senin_epostan")) {
    console.log(`📩 Simüle Edilen Hediye Puan Kullanım Maili -> ${businessEmail}`);
    console.log(`🎁 Kod: ${details.redemptionCode} (Müşteri: ${details.customerName})`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const mailOptions = {
    from: `"MBrandev Sadakat Sistemi" <${process.env.EMAIL_USER}>`,
    to: businessEmail,
    subject: 'Hediye Hizmet Kullanımı! - ' + details.customerName,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #8E4A5D; text-align: center;">🎁 Hediye Hizmet Reddi</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Müşteriniz <b>${details.customerName}</b>, 100 sadakat puanını kullanarak bir ücretsiz hizmet hakkı kazandı ve bu hakkı şu anda kullanmak istiyor.
        </p>
        <div style="background-color: #fce7f3; padding: 25px; border-radius: 15px; margin: 25px 0; border: 2px dashed #8E4A5D; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #8E4A5D; font-weight: 700;">HEDİYE DOĞRULAMA KODU</p>
          <p style="margin: 10px 0; font-size: 36px; font-weight: 900; color: #8E4A5D; letter-spacing: 2px;">${details.redemptionCode}</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><b>Müşteri:</b> ${details.customerName}</p>
          <p style="margin: 5px 0;"><b>Tarih:</b> ${new Date().toLocaleDateString('tr-TR')}</p>
          <p style="margin: 5px 0;"><b>Durum:</b> Puanlar müşterinin hesabından düşülmüştür.</p>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">Lütfen müşterinize bu hizmeti ücretsiz olarak tanımlayın.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">© 2026 MBrandev Sadakat Programı</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Hediye kullanım maili gönderildi:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Hediye maili gönderim hatası:", error.message);
  }
};

