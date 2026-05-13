const redis = require('redis');
const amqp = require('amqplib');

// Redis Bağlantısı
let redisClient;
const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://redis:6379'
        });
        redisClient.on('error', (err) => console.log('Redis Hatası:', err));
        await redisClient.connect();
        console.log('✅ Redis Bağlantısı Başarılı');
    } catch (error) {
        console.error('❌ Redis Bağlantı Hatası:', error.message);
    }
};

// RabbitMQ Bağlantısı ve Consumer (İşçi) Başlatma
let amqpChannel;
const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
        amqpChannel = await connection.createChannel();
        console.log('✅ RabbitMQ Bağlantısı Başarılı');

        // --- BİLDİRİM İŞÇİSİ (CONSUMER) BAŞLAT ---
        const Notification = require("../models/Notification");
        const queue = 'notifications_queue';
        
        await amqpChannel.assertQueue(queue, { durable: true });
        console.log(`👂 [RabbitMQ] ${queue} dinleniyor...`);

        amqpChannel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const data = JSON.parse(msg.content.toString());
                    console.log('📨 [RabbitMQ] Yeni bildirim işleniyor:', data.message);
                    
                    await new Notification(data).save();
                    
                    amqpChannel.ack(msg); // Mesajın işlendiğini onayla
                } catch (err) {
                    console.error('❌ [RabbitMQ] Mesaj işleme hatası:', err.message);
                    amqpChannel.nack(msg); // Hata durumunda mesajı geri bırak
                }
            }
        });

    } catch (error) {
        console.error('❌ RabbitMQ Bağlantı Hatası:', error.message);
    }
};

module.exports = { connectRedis, connectRabbitMQ, redisClient, amqpChannel };
