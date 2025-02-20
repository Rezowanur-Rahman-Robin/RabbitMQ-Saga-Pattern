// notification-service/index.js
const amqp = require('amqplib');
const RABBITMQ_URL = 'amqp://admin:admin@rabbitmq';
const INVENTORY_UPDATED = 'inventory_updated';
const PAYMENT_PROCESSED = 'payment_processed';

async function startConsumer() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(INVENTORY_UPDATED, 'fanout', { durable: true });
    await channel.assertExchange(PAYMENT_PROCESSED, 'fanout', { durable: true });
    const queue = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(queue.queue, INVENTORY_UPDATED, '');
    channel.bindQueue(queue.queue, PAYMENT_PROCESSED, '');

    channel.consume(queue.queue, async (msg) => {
        const event = JSON.parse(msg.content.toString());
        console.log('Notification Sent:', event);
    }, { noAck: true });
}

startConsumer();