// payment-service/index.js
const amqp = require('amqplib');
const RABBITMQ_URL = 'amqp://admin:admin@rabbitmq';
const ORDER_CREATED = 'order_created';
const PAYMENT_PROCESSED = 'payment_processed';

async function startConsumer() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(ORDER_CREATED, 'fanout', { durable: true });
    const queue = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(queue.queue, ORDER_CREATED, '');

    channel.consume(queue.queue, async (msg) => {
        const order = JSON.parse(msg.content.toString());
        console.log('Payment Processed for Order:', order.id);
        await publishPaymentProcessed(order);
    }, { noAck: true });
}

async function publishPaymentProcessed(order) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(PAYMENT_PROCESSED, 'fanout', { durable: true });
    channel.publish(PAYMENT_PROCESSED, '', Buffer.from(JSON.stringify(order)));
    console.log('Payment Processed Event Published:', order);
    setTimeout(() => connection.close(), 500);
}

startConsumer();