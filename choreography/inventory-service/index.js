// inventory-service/index.js
const amqp = require('amqplib');
const RABBITMQ_URL = 'amqp://admin:admin@rabbitmq';
const ORDER_CREATED = 'order_created';
const INVENTORY_UPDATED = 'inventory_updated';

async function startConsumer() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(ORDER_CREATED, 'fanout', { durable: true });
    await channel.assertQueue('', { exclusive: true });
    channel.bindQueue('', ORDER_CREATED, '');

    channel.consume('', async (msg) => {
        const order = JSON.parse(msg.content.toString());
        console.log('Inventory Updated for Order:', order.id);
        await publishInventoryUpdated(order);
    }, { noAck: true });
}

async function publishInventoryUpdated(order) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(INVENTORY_UPDATED, 'fanout', { durable: true });
    channel.publish(INVENTORY_UPDATED, '', Buffer.from(JSON.stringify(order)));
    console.log('Inventory Updated Event Published:', order);
    setTimeout(() => connection.close(), 500);
}

startConsumer();