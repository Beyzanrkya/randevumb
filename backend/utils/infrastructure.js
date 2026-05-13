const redis = require('redis');
const amqp = require('amqplib');

const infrastructure = {
    redisClient: null,
    amqpChannel: null,
    connectRedis: async () => {
        try {
            infrastructure.redisClient = redis.createClient({
                url: process.env.REDIS_URL || 'redis://redis:6379'
            });
            infrastructure.redisClient.on('error', (err) => console.log('Redis Hatası:', err));
            await infrastructure.redisClient.connect();
            console.log('✅ Redis Bağlantısı Başarılı');
        } catch (error) {
            console.error('❌ Redis Bağlantı Hatası:', error.message);
        }
    },
    connectRabbitMQ: async () => {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
            infrastructure.amqpChannel = await connection.createChannel();
            console.log('✅ RabbitMQ Bağlantısı Başarılı');

            const Notification = require("../models/Notification");
            const queue = 'notifications_queue';
            await infrastructure.amqpChannel.assertQueue(queue, { durable: true });
            
            infrastructure.amqpChannel.consume(queue, async (msg) => {
                if (msg !== null) {
                    try {
                        const data = JSON.parse(msg.content.toString());
                        await new Notification(data).save();
                        infrastructure.amqpChannel.ack(msg);
                    } catch (err) {
                        infrastructure.amqpChannel.nack(msg);
                    }
                }
            });
        } catch (error) {
            console.error('❌ RabbitMQ Bağlantı Hatası:', error.message);
        }
    }
};

module.exports = infrastructure;
